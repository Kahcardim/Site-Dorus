import "./styles/main.css";

// Paint the pre-rendered content before downloading interactive components.
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    import("./hydrate.jsx").catch((error) => {
      console.error(
        "Não foi possível iniciar os componentes interativos.",
        error,
      );
    });
  });
});
