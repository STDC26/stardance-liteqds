import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// Staging-equivalent internal_review_surface harness (IG-0). Additive — renders
// the certified components through the certified adapter + the IG-0 mount.
export default defineConfig({
  root: resolve(__dirname, "xas/integration-harness"),
  plugins: [react()],
  build: {
    outDir: resolve(__dirname, "xas/integration-harness/dist"),
    emptyOutDir: true,
  },
  server: {
    port: 4319,
    strictPort: true,
    fs: { allow: [resolve(__dirname)] },
  },
  preview: { port: 4319, strictPort: true },
});
