import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { InternalReviewSurface } from "./InternalReviewSurface";
// Reuse the certified harness stylesheet unchanged.
import "../../harness/src/styles.css";
import "./surface.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <InternalReviewSurface />
  </StrictMode>,
);
