import type { StorybookConfig } from "@storybook/react-vite";
import { readdirSync } from "fs";
import { mergeConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { dirname, join, resolve } from "path";

function getAbsolutePath(value: string) {
  return dirname(require.resolve(join(value, "package.json")));
}

function listChildDirectoryNames(
  relativePath: string,
  baseDir: string
): string[] {
  return readdirSync(resolve(baseDir, relativePath), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name);
}

const projectRoot = join(__dirname, "..");

function createAliases(): Record<string, string> {
  const alias: Record<string, string> = {};

  listChildDirectoryNames("..", __dirname).forEach((dir) => {
    alias[dir] = resolve(projectRoot, dir);
    alias[`$${dir}`] = resolve(projectRoot, dir);
  });
  listChildDirectoryNames("../components", __dirname).forEach((dir) => {
    alias[`$${dir}`] = resolve(projectRoot, "components", dir);
  });

  return alias;
}

const config: StorybookConfig = {
  stories: ["../components/**/*.stories.tsx"],
  addons: [
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-essentials"),
  ],
  staticDirs: [
    { from: "../public/favicon.ico", to: "/favicon.ico" },
    { from: "../public/logo.png", to: "/logo.png" },
    {
      from: "../public/video-thumbnail-placeholder.png",
      to: "/video-thumbnail-placeholder.png",
    },
  ],
  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {},
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      plugins: [tsconfigPaths({ root: projectRoot })],
      resolve: {
        alias: createAliases(),
      },
    });
  },
};

export default config;
