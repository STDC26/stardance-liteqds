import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// Static render harness — no backend. Root is harness/.
export default defineConfig({
  root: resolve(__dirname, "harness"),
  plugins: [react()],
  build: {
    outDir: resolve(__dirname, "harness/dist"),
    emptyOutDir: true,
  },
  server: { port: 4317, strictPort: true },
  preview: { port: 4317, strictPort: true },
});
