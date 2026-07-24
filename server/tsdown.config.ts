import { defineConfig } from "tsdown";

export default defineConfig({
  format: ["esm"],
  entry: {
    index: "index.ts",
    downloadCli: "utils/activity/downloadCli.ts",
  },
  target: "node20",
  platform: "node",
  outDir: "dist",
  clean: true,
  hash: false,
  outExtensions: () => ({ js: ".js" }),
  deps: {
    onlyBundle: false,
  },
});
