import { useEffect, useState } from "react";
import initialRating from "../../public/google-rating.json";

const CONSENT_KEY = "dorus_consent";

export function useGoogleRating() {
  const [rating, setRating] = useState({
    rating: Number(initialRating.rating),
    reviews: Number(initialRating.reviews),
  });

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/google-rating.json?v=${Date.now()}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) =>
        response.ok
          ? response.json()
          : Promise.reject(new Error(String(response.status))),
      )
      .then((data) => {
        if (
          Number.isFinite(Number(data.rating)) &&
          Number.isInteger(Number(data.reviews))
        ) {
          setRating({
            rating: Number(data.rating),
            reviews: Number(data.reviews),
          });
        }
      })
      .catch((error) => {
        if (error.name !== "AbortError")
          console.error("[D’orus] Avaliação indisponível.", error);
      });
    return () => controller.abort();
  }, []);

  return rating;
}

export function useNativeAccessibility() {
  useEffect(() => {
    const preferences = {
      reducedMotion: "(prefers-reduced-motion: reduce)",
      moreContrast: "(prefers-contrast: more)",
      forcedColors: "(forced-colors: active)",
      reducedTransparency: "(prefers-reduced-transparency: reduce)",
    };
    const cleanups = Object.entries(preferences).map(([name, query]) => {
      const media = window.matchMedia(query);
      const attribute = `data-a11y-${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
      const update = () =>
        document.documentElement.setAttribute(attribute, String(media.matches));
      update();
      media.addEventListener?.("change", update);
      return () => media.removeEventListener?.("change", update);
    });
    document.documentElement.dataset.a11yNative = "ready";
    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);
}

export function useConsent() {
  const readStored = () => {
    if (typeof window === "undefined") return "essential";
    const cookie = document.cookie.match(/(?:^|; )dorus_consent=([^;]*)/);
    return cookie
      ? decodeURIComponent(cookie[1])
      : localStorage.getItem(CONSENT_KEY);
  };
  const [consent, setConsent] = useState("pending");
  useEffect(() => {
    const stored = readStored();
    if (stored) document.documentElement.dataset.cookieConsent = stored;
    setConsent(stored || null);
  }, []);
  const saveConsent = (value) => {
    document.cookie = `${CONSENT_KEY}=${value}; Path=/; Max-Age=15552000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
    localStorage.setItem(CONSENT_KEY, value);
    document.documentElement.dataset.cookieConsent = value;
    window.dispatchEvent(
      new CustomEvent("dorus:consent", { detail: { value } }),
    );
    setConsent(value);
  };
  return { consent, saveConsent, reopen: () => setConsent(null) };
}
