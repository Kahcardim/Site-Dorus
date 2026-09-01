import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "react-dev-entry",
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          const path = (req.url || "/").split("?")[0];
          if (
            !path.startsWith("/@") &&
            !path.startsWith("/src/") &&
            !path.startsWith("/node_modules/") &&
            (path.endsWith("/") || path.endsWith(".html"))
          )
            req.url = "/app.html";
          next();
        });
      },
    },
  ],
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: "app.html",
    },
  },
});
