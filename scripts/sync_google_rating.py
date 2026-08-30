import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "google-rating.json"


def fail(message: str) -> None:
    print(f"[google-rating] {message}", file=sys.stderr)
    raise SystemExit(1)


def main() -> None:
    api_key = os.environ.get("GOOGLE_PLACES_API_KEY", "").strip()
    place_id = os.environ.get("GOOGLE_PLACE_ID", "").strip()

    if not api_key:
        fail("GOOGLE_PLACES_API_KEY não configurada.")
    if not place_id:
        fail("GOOGLE_PLACE_ID não configurado.")

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
        fail(f"Places API HTTP {error.code}: {detail[:500]}")
    except Exception as error:
        fail(f"Falha ao consultar Places API: {error}")

    try:
        rating = float(payload["rating"])
        reviews = int(payload["userRatingCount"])
    except (KeyError, TypeError, ValueError) as error:
        fail(f"Resposta inválida da Places API: {error}")

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
