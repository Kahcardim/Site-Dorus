import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "google-rating.json"
SEARCH_QUERY = "D'orus Assistência Técnica Guarulhos 11 91357-3932"
EXPECTED_PLACE_ID = "ChIJZyk7iQ31zpQR0C-R3wgVywg"


def fail(message: str) -> None:
    print(f"[google-rating] {message}", file=sys.stderr)
    raise SystemExit(1)


def safe_payload_summary(payload: object) -> str:
    if not isinstance(payload, dict):
        return f"tipo={type(payload).__name__}"

    summary = {"keys": sorted(payload.keys())}
    display_name = payload.get("displayName")
    if isinstance(display_name, dict):
        summary["displayName"] = display_name.get("text")

    error = payload.get("error")
    if isinstance(error, dict):
        summary["error"] = {
            "code": error.get("code"),
            "status": error.get("status"),
            "message": error.get("message"),
        }

    return json.dumps(summary, ensure_ascii=False)


def discover_candidates(api_key: str) -> list[dict]:
    url = "https://places.googleapis.com/v1/places:searchText"
    body = json.dumps(
        {
            "textQuery": SEARCH_QUERY,
            "languageCode": "pt-BR",
            "regionCode": "BR",
        }
    ).encode("utf-8")

    request = urllib.request.Request(
        url,
        data=body,
        headers={
            "X-Goog-Api-Key": api_key,
            "X-Goog-FieldMask": (
                "places.id,places.displayName,places.formattedAddress,"
                "places.nationalPhoneNumber,places.rating,places.userRatingCount"
            ),
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "Dorus-GitHub-Actions/1.0",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        fail(f"Text Search HTTP {error.code}: {detail[:1000]}")
    except Exception as error:
        fail(f"Falha ao pesquisar ficha da D'orus: {error}")

    places = payload.get("places", []) if isinstance(payload, dict) else []
    candidates = []
    for place in places[:5]:
        display_name = place.get("displayName") or {}
        candidates.append(
            {
                "id": place.get("id"),
                "name": display_name.get("text") if isinstance(display_name, dict) else None,
                "address": place.get("formattedAddress"),
                "phone": place.get("nationalPhoneNumber"),
                "rating": place.get("rating"),
                "reviews": place.get("userRatingCount"),
            }
        )

    print("[google-rating] candidatos Text Search:")
    print(json.dumps(candidates, ensure_ascii=False, indent=2))
    return candidates


def main() -> None:
    api_key = os.environ.get("GOOGLE_PLACES_API_KEY", "").strip()
    place_id = os.environ.get("GOOGLE_PLACE_ID", "").strip()

    if not api_key:
        fail("GOOGLE_PLACES_API_KEY não configurada.")
    if not place_id:
        fail("GOOGLE_PLACE_ID não configurado.")
    if place_id != EXPECTED_PLACE_ID:
        fail("GOOGLE_PLACE_ID não corresponde à ficha pública validada da D'orus.")

    url = "https://places.googleapis.com/v1/places/" + urllib.parse.quote(place_id, safe="")
    request = urllib.request.Request(
        url,
        headers={
            "X-Goog-Api-Key": api_key,
            "X-Goog-FieldMask": "rating,userRatingCount,displayName",
            "Accept": "application/json",
            "User-Agent": "Dorus-GitHub-Actions/1.0",
        },
        method="GET",
    )

    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        fail(f"Places API HTTP {error.code}: {detail[:1000]}")
    except Exception as error:
        fail(f"Falha ao consultar Places API: {error}")

    try:
        rating = float(payload["rating"])
        reviews = int(payload["userRatingCount"])
    except (KeyError, TypeError, ValueError) as error:
        print(
            "[google-rating] Place ID atual não possui rating/userRatingCount. "
            f"Detalhes seguros: {safe_payload_summary(payload)}; erro={error}"
        )
        discover_candidates(api_key)
        fail("Place ID atual não corresponde à ficha comercial avaliada. Use um dos candidatos acima após validação.")

    if not 1 <= rating <= 5:
        fail(f"Nota fora do intervalo esperado: {rating}")
    if reviews < 0:
        fail(f"Quantidade de avaliações inválida: {reviews}")

    result = {
        "rating": round(rating, 1),
        "reviews": reviews,
        "source": "Google",
        "updatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
    }

    OUTPUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"[google-rating] atualizado: {result['rating']} / {result['reviews']} avaliações")


if __name__ == "__main__":
    main()
