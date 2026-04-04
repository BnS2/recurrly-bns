import tailwindV4 from "@bns2/eslint-plugin-tailwind-v4";
import biomeConfig from "eslint-config-biome";
import expoConfig from "eslint-config-expo/flat.js";
import tailwindCanonical from "eslint-plugin-tailwind-canonical-classes";

/** @type {import('eslint').Linter.Config[]} */
export default [
	...expoConfig,
	biomeConfig,
	{
		ignores: ["dist/*", ".expo/*", "node_modules/*"],
	},
	{
		files: ["**/*.{js,jsx,ts,tsx}"],
		plugins: {
			"tailwind-v4": tailwindV4,
			"tailwind-canonical-classes": tailwindCanonical,
		},
		rules: {
			"tailwind-v4/typo": ["error", { cssPath: "./global.css" }],
			"tailwind-canonical-classes/tailwind-canonical-classes": ["error", { cssPath: "./global.css" }],
		},
	},
];
