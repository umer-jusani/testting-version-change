import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// "dev" || "prod"
const environment = "dev";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: `dist`,
    manifest: "manifest.json",
    rollupOptions: {
      output: {
        manualChunks(id) {
          const cleanId = id.split("?")[0].replace(/\\/g, "/");

          const isTargetFile =
            (cleanId.endsWith(".jsx") || cleanId.endsWith(".js")) &&
            (cleanId.includes("/src/components/") ||
              cleanId.includes("/src/pages/"));

          if (!isTargetFile) {
            return;
          }

          return path.parse(cleanId).name;
        },
      },
    },
  },
});
