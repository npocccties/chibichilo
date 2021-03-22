const { basename, resolve } = require("path");
const { sync: glob } = require("glob");

module.exports = {
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
  addons: ["@storybook/addon-a11y"],
};
