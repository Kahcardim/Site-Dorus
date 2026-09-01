import "./styles/main.css";

let started = false;
function hydrate() {
  if (started) return;
  started = true;
  import("./hydrate.jsx").catch((error) => {
    console.error("Não foi possível iniciar os componentes interativos.", error);
  });
}

// Animation callbacks run before paint; wait for the actual rendered content.
if (globalThis.PerformanceObserver?.supportedEntryTypes?.includes("paint")) {
  const observer = new PerformanceObserver((list) => {
    if (list.getEntries().some((entry) => entry.name === "first-contentful-paint")) {
      observer.disconnect();
      hydrate();
    }
  });
  observer.observe({ type: "paint", buffered: true });
} else {
  requestAnimationFrame(() => setTimeout(hydrate, 0));
}
