import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// QDS Lite Product MVP — user-facing intake + result flow.
export default defineConfig({
  root: resolve(__dirname, "product"),
  plugins: [react()],
  build: {
    outDir: resolve(__dirname, "product/dist"),
    emptyOutDir: true,
  },
  server: { port: 4320, strictPort: true },
  preview: { port: 4320, strictPort: true },
});
