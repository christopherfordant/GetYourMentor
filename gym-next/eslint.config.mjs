import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: ["next/core-web-vitals", "next/typescript"],
  }),
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "playwright-artifacts/**",
      "playwright-report/**",
      "test-results/**",
      "scripts/*.cjs",
    ],
  },
  {
    files: ["components/**/*-legacy/**/*.tsx", "components/**/*Legacy*.tsx"],
    rules: {
      // These legacy screens are still covered by Playwright while they are
      // migrated; keep the findings visible without blocking the new lint gate.
      "react/no-unescaped-entities": "warn",
      "@next/next/no-html-link-for-pages": "warn",
    },
  },
];

export default eslintConfig;
