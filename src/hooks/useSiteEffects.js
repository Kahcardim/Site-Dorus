import { useEffect, useState } from "react";
import initialRating from "../../public/google-rating.json";

const CONSENT_KEY = "dorus_consent";
let ratingRequest;
let ratingRequestedAt = 0;
const RATING_REFRESH_MS = 5 * 60 * 1000;

function loadRating() {
  if (!ratingRequest || Date.now() - ratingRequestedAt >= RATING_REFRESH_MS) {
    ratingRequestedAt = Date.now();
    ratingRequest = fetch(`/google-rating.json?v=${Date.now()}`, {
      cache: "no-store",
    })
      .then((response) =>
        response.ok
          ? response.json()
          : Promise.reject(new Error(String(response.status))),
      )
      .catch((error) => {
        ratingRequest = undefined;
        throw error;
      });
  }
  return ratingRequest;
}

export function useGoogleRating() {
  const [rating, setRating] = useState({
    rating: Number(initialRating.rating),
    reviews: Number(initialRating.reviews),
  });

  useEffect(() => {
    let active = true;
    const refresh = () =>
      loadRating()
        .then((data) => {
          if (
            active &&
            Number.isFinite(Number(data.rating)) &&
            Number.isInteger(Number(data.reviews))
          ) {
            setRating((previous) =>
              previous.rating === Number(data.rating) &&
              previous.reviews === Number(data.reviews)
                ? previous
                : {
                    rating: Number(data.rating),
                    reviews: Number(data.reviews),
                  },
            );
          }
        })
        .catch((error) => {
          if (error.name !== "AbortError")
            console.error("[D’orus] Avaliação indisponível.", error);
        });
    refresh();
    const timer = window.setInterval(refresh, RATING_REFRESH_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      active = false;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
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
    try {
      const cookie = document.cookie.match(/(?:^|; )dorus_consent=([^;]*)/);
      const value = cookie
        ? decodeURIComponent(cookie[1])
        : localStorage.getItem(CONSENT_KEY);
      return value === "all" || value === "essential" ? value : null;
    } catch {
      return null;
    }
  };
  const [consent, setConsent] = useState("pending");
  useEffect(() => {
    const stored = readStored();
    if (stored) document.documentElement.dataset.cookieConsent = stored;
    setConsent(stored || null);
  }, []);
  const saveConsent = (value) => {
    document.cookie = `${CONSENT_KEY}=${value}; Path=/; Max-Age=15552000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {
      /* Cookie remains available. */
    }
    document.documentElement.dataset.cookieConsent = value;
    window.dispatchEvent(
      new CustomEvent("dorus:consent", { detail: { value } }),
    );
    setConsent(value);
  };
  return {
    consent,
    saveConsent,
    reopen: () => {
      delete document.documentElement.dataset.cookieConsent;
      setConsent(null);
    },
  };
}
