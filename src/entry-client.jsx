import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { App } from "./App.jsx";
import "./styles/main.css";

hydrateRoot(
  document.getElementById("root"),
  <StrictMode>
    <App path={window.location.pathname} />
  </StrictMode>,
);
