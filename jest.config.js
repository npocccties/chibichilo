const { pathsToModuleNameMapper } = require("ts-jest/utils");
const { workspaces } = require("./package.json");
const { compilerOptions } = require("./tsconfig.json");

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: workspaces,
  projects: [__dirname, ...workspaces],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: __dirname,
  }),
};
