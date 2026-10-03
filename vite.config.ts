import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig, loadEnv } from "vite";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir, "NEXT_PUBLIC_");

  return {
    plugins: [
      react(),
      tsconfigPaths({ root: rootDir }),
      nodePolyfills({ include: ["events", "buffer"] }),
    ],
    base: env.NEXT_PUBLIC_BASE_PATH || "/",
    envPrefix: ["NEXT_PUBLIC_"],
    build: {
      outDir: "server/dist/public",
      emptyOutDir: true,
    },
    server: {
      port: 3000,
      proxy: {
        "/api": {
          target: "http://localhost:8080",
          changeOrigin: true,
        },
      },
    },
  };
});
