import { StorybookConfig } from "@storybook/nextjs";
import { basename, dirname, join, resolve } from "path";
import { sync as glob } from "glob";

function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, "package.json")));
}

const config: StorybookConfig = {
  webpackFinal: async (config) => {
    glob(`../*/`, { cwd: __dirname })
      .map((path) => basename(path))
      .forEach((dir) => {
        config.resolve.alias[dir] = resolve(__dirname, "..", dir);
        config.resolve.alias[`$${dir}`] = resolve(__dirname, "..", dir);
      });
    glob(`../components/*/`, { cwd: __dirname })
      .map((path) => basename(path))
      .forEach((dir) => {
        config.resolve.alias[`$${dir}`] = resolve(
          __dirname,
          "..",
          "components",
          dir
        );
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
