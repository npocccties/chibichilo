const path = require("path");

module.exports = {
  webpackFinal: async (config) => {
    config.resolve.alias["theme"] = path.resolve(__dirname, "../theme");
    config.resolve.alias["styles"] = path.resolve(__dirname, "../styles");
    config.resolve.alias["samples"] = path.resolve(__dirname, "../samples");
    config.resolve.alias["$store"] = path.resolve(__dirname, "../store");
    config.resolve.alias["$atoms"] = path.resolve(
      __dirname,
      "../components/atoms"
    );
    config.resolve.alias["$molecules"] = path.resolve(
      __dirname,
      "../components/molecules"
    );
    config.resolve.alias["$organisms"] = path.resolve(
      __dirname,
      "../components/organisms"
    );
    config.resolve.alias["$templates"] = path.resolve(
      __dirname,
      "../components/templates"
    );
    return config;
  },
  stories: ["../components/**/*.stories.tsx"],
};
