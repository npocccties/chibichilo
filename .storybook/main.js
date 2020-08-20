module.exports = {
  stories: ["../components/**/*.stories.tsx"],
  webpackFinal: (config) => {
    config.resolve.extensions.push(".ts", ".tsx");
    config.module.rules.push({
      test: /\.tsx?$/,
      loader: require.resolve("babel-loader"),
      options: {
        presets: ["next/babel"],
      },
    });

    // FIXME: Error: 'loose' mode configuration must be the same for both @babel/plugin-proposal-class-properties and @babel/plugin-proposal-private-methods
    config.module.rules.forEach((rule) => {
      if (!Array.isArray(rule.use)) return;
      if (!Array.isArray(rule.use[0].options?.plugins)) return;
      const plugins = rule.use[0].options.plugins;
      rule.use[0].options.plugins = plugins.filter(
        (plugin) =>
          plugin !== require.resolve("@babel/plugin-proposal-class-properties")
      );
    });

    return config;
  },
};
