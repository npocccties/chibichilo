const { pathsToModuleNameMapper } = require("ts-jest");
const workspaces = ["server"];
const { compilerOptions } = require("./tsconfig.json");

module.exports = {
  preset: "ts-jest/presets/js-with-ts",
  transformIgnorePatterns: [
    "/node_modules/(?!\\.pnpm/[^/]+/node_modules/yn)(?!yn/)",
  ], // NOTE: "yn" is Pure ESM package
  transform: { "^.+\\.tsx?$": ["ts-jest", { isolatedModules: true }] },
  testPathIgnorePatterns: workspaces,
  projects: [__dirname, ...workspaces],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: __dirname,
  }),
};
