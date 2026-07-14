import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";
import storybook from "eslint-plugin-storybook";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import { fileURLToPath } from "node:url";
import path from "node:path";

const tsconfigRootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig([
  globalIgnores([
    ".next/**",
    "dist/**",
    "out/**",
    "build/**",
    "node_modules/**",
    "api/v2.ts",
    ".vercel/**",
    "server/dist/**",
    "server/prisma/migrations/**",
    "openapi/**",
    "public/api/v2/swagger/**",
    "public/storybook/**",
    "public/LICENSE",
  ]),
  js.configs.recommended,
  ...storybook.configs["flat/recommended"],
  eslintConfigPrettier,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "@typescript-eslint": tsPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "jsx-a11y": jsxA11yPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "tsconfig.eslint.json",
        tsconfigRootDir,
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      "no-undef": "off",
      "no-redeclare": "off",
      "@typescript-eslint/no-redeclare": "error",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-floating-promises": [
        "error",
        { ignoreVoid: true },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
      ],
      "import/no-anonymous-default-export": "off",
      "react/display-name": "off",
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "storybook/no-renderer-packages": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
      "react-hooks/immutability": "off",
      "react-hooks/incompatible-library": "off",
      "react-hooks/preserve-manual-memoization": "off",
    },
  },
  {
    files: [
      "server/models/**",
      "server/validators/**",
      "server/services/**",
      "components/organisms/ActivityRewatchGraph.tsx",
    ],
    rules: {
      "@typescript-eslint/no-redeclare": "off",
    },
  },
  {
    files: ["server/utils/ltiv1p3/findClient.ts"],
    rules: {
      "react-hooks/rules-of-hooks": "off",
    },
  },
  {
    files: ["utils/eventLogger/playerTracker.ts"],
    rules: {
      "constructor-super": "off",
    },
  },
  {
    files: ["samples/**"],
    rules: {
      "no-irregular-whitespace": "off",
    },
  },
  {
    files: ["types/defaultTheme.d.ts"],
    rules: {
      "@typescript-eslint/no-empty-interface": "off",
    },
  },
  {
    files: ["server/utils/handler.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    files: ["server/config/seeds/*"],
    rules: {
      "no-irregular-whitespace": "off",
    },
  },
]);
