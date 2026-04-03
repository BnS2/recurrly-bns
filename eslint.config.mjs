import expoConfig from "eslint-config-expo/flat.js";
import tailwindV4 from "@bns2/eslint-plugin-tailwind-v4";

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...expoConfig,
  {
    ignores: ["dist/*", ".expo/*"],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "tailwind-v4": tailwindV4,
    },
    rules: {
      "tailwind-v4/typo": ["error", { cssPath: "./global.css" }],
    },
  },
];
