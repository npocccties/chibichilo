import { StorybookConfig } from "@storybook/nextjs";
import { readdirSync } from "fs";
import { dirname, join, resolve } from "path";

function getAbsolutePath(value) {
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

const config: StorybookConfig = {
  webpackFinal: async (config) => {
    const resolveConfig = (config.resolve ??= {});
    const alias = (resolveConfig.alias ??= {});

    listChildDirectoryNames("..", __dirname).forEach((dir) => {
      alias[dir] = resolve(__dirname, "..", dir);
      alias[`$${dir}`] = resolve(__dirname, "..", dir);
    });
    listChildDirectoryNames("../components", __dirname).forEach((dir) => {
      alias[`$${dir}`] = resolve(__dirname, "..", "components", dir);
    });
    return config;
  },

  stories: ["../components/**/*.stories.tsx"],
  addons: [
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-essentials"),
  ],

  framework: {
    name: getAbsolutePath("@storybook/nextjs"),
    options: {},
  },

  docs: {
    autodocs: true,
  },
};

export default config;
