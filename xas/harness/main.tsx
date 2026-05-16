import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { XASApp } from "./XASApp";
// Reuse the certified harness stylesheet unchanged.
import "../../harness/src/styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <XASApp />
  </StrictMode>,
);
