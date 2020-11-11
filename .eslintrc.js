module.exports = {
  root: true,
  extends: ["airbnb-typescript"],
  parserOptions: {
    project: "./tsconfig.eslint.json",
  },
  rules: {
    "@typescript-eslint/quotes": ["error", "double"],
    "import/no-extraneous-dependencies": ["error", { devDependencies: true }],
    "react/react-in-jsx-scope": "off",
  },
};
