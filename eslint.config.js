import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    ignores: [
      "**/__tests__/**",
      "**/*.test.{js,ts,tsx,jsx}",
      "**/*.spec.{js,ts,tsx,jsx}"
    ]
  },
  {
    files: ["**/*.{js,ts,jsx,tsx}"],
    rules: {
      "no-unused-vars": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "no-console": "warn",
      "prefer-const": "warn",
      "no-var": "error"
    }
  }
]);
