import { useEffect, useId, useRef, useState } from "react";

export function Carousel({ label, className, children, autoPlay = false }) {
  const id = useId();
  const track = useRef(null);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const move = (direction, manual = true) => {
    const element = track.current;
    if (!element) return;
    if (manual) setPaused(true);
    const max = element.scrollWidth - element.clientWidth;
    const step =
      element.firstElementChild?.getBoundingClientRect().width || 180;
    const gap = parseFloat(getComputedStyle(element).columnGap) || 16;
    const atEnd = element.scrollLeft >= max - 2;
    const atStart = element.scrollLeft <= 2;
    const left =
      direction > 0 && atEnd
        ? 0
        : direction < 0 && atStart
          ? max
          : element.scrollLeft + direction * (step + gap);
    element.scrollTo({ left, behavior: reducedMotion ? "instant" : "smooth" });
  };

  useEffect(() => {
    if (!autoPlay || paused || reducedMotion || hovered || focused) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) move(1, false);
    }, 3500);
    return () => window.clearInterval(timer);
  }, [autoPlay, paused, reducedMotion, hovered, focused]);

  return (
    <div
      className="accessible-carousel"
      role="group"
      aria-roledescription="carrossel"
      aria-label={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
    >
      <div className="carousel-toolbar">
        <p id={`${id}-help`}>
          Use as setas para percorrer {label.toLowerCase()} ou deslize no
          celular.
        </p>
        <div className="carousel-buttons">
          <button
            type="button"
            aria-label={`Anterior: ${label}`}
            aria-controls={id}
            onClick={() => move(-1)}
          >
            ←
          </button>
          {autoPlay && (
            <button
              type="button"
              aria-controls={id}
              aria-pressed={paused || reducedMotion}
              disabled={reducedMotion}
              onClick={() => setPaused(!paused)}
            >
              {paused || reducedMotion ? "Retomar" : "Pausar"}
              <span className="sr-only">
                {" "}
                carrossel de {label.toLowerCase()}
              </span>
            </button>
          )}
          <button
            type="button"
            aria-label={`Próximo: ${label}`}
            aria-controls={id}
            onClick={() => move(1)}
          >
            →
          </button>
        </div>
      </div>
      <div
        id={id}
        className={`carousel-track ${className}`}
        ref={track}
        tabIndex="0"
        role="group"
        aria-label={label}
        aria-describedby={`${id}-help`}
        onPointerDown={() => setPaused(true)}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault();
            move(event.key === "ArrowRight" ? 1 : -1);
          }
        }}
      >
        {children}
      </div>
    </div>
  );
}
