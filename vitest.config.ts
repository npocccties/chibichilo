import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)));

export default defineConfig({
  plugins: [react(), tsconfigPaths({ root: rootDir })],
  test: {
    environment: "jsdom",
    globals: true,
    include: ["**/*.{test,spec}.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/server/**"],
  },
});
