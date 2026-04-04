/**
 * A simple logger utility for React Native.
 * 
 * In React Native, `__DEV__` is a global boolean injected by the Metro bundler.
 * It is automatically true in development (like Expo Go) and false in production builds.
 */
export const logger = {
	error: (message: string, error?: unknown) => {
		if (__DEV__) {
			let errorDetails = "";
			if (error instanceof Error) {
				errorDetails = `\nName: ${error.name}\nMessage: ${error.message}\nStack: ${error.stack}`;
			} else if (error) {
				errorDetails = JSON.stringify(error, null, 2);
			}
			console.log(`[🚨 ERROR] ${message}${errorDetails}`);
		}
	},
	log: (message: string, data?: unknown) => {
		if (__DEV__) {
			console.log(`[ℹ️ INFO] ${message}`, data ? JSON.stringify(data, null, 2) : "");
		}
	},
};
