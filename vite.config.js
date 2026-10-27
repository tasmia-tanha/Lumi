import { defineConfig } from "vite";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  build: {
    outDir: "frontend/dist",
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, "frontend/js/noteEditor.js"),
      output: {
        entryFileNames: "noteEditor.js",
      },
    },
  },
});