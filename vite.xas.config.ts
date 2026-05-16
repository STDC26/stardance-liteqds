import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// XAS integration harness — additive. Renders the CERTIFIED renderer
// components through the XAS adapter. Does not modify harness/ or src/.
export default defineConfig({
  root: resolve(__dirname, "xas/harness"),
  plugins: [react()],
  build: {
    outDir: resolve(__dirname, "xas/harness/dist"),
    emptyOutDir: true,
  },
  server: {
    port: 4318,
    strictPort: true,
    fs: { allow: [resolve(__dirname)] },
  },
  preview: { port: 4318, strictPort: true },
});
