// eslint-disable-next-line @typescript-eslint/no-require-imports
const appJson = require("./app.json");

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
	...appJson.expo,
	extra: {
		...(appJson.expo.extra ?? {}),
		posthogProjectToken: process.env.EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN,
		posthogHost: process.env.EXPO_PUBLIC_POSTHOG_HOST,
	},
};
