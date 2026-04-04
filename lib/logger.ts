/**
 * A simple logger utility for React Native.
 * 
 * In React Native, `__DEV__` is a global boolean injected by the Metro bundler.
 * It is automatically true in development (like Expo Go) and false in production builds.
 */
export const logger = {
	error: (message: string, error?: unknown) => {
		if (__DEV__) {
			// Using console.log instead of console.error to avoid the full-screen 
			// Red LogBox overlay in development interrupting UI testing.
			console.log(`[🚨 ERROR] ${message}`, error ? JSON.stringify(error, null, 2) : "");
		}
		// In production, we could send this to Sentry, Datadog, or Crashlytics here.
	},
	log: (message: string, data?: unknown) => {
		if (__DEV__) {
			console.log(`[ℹ️ INFO] ${message}`, data ? JSON.stringify(data, null, 2) : "");
		}
	},
};
