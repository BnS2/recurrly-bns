import "@/global.css";
import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { logger } from "@/lib/logger";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;


if (!publishableKey) {
	throw new Error(
		"Add your Clerk Publishable Key (EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY) to the .env.local file",
	);
}


export const unstable_settings = {
	initialRouteName: "(tabs)",
};

export default function RootLayout() {
	const [fontsLoaded, fontsError] = useFonts({
		"sans-regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
		"sans-light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
		"sans-medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
		"sans-bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
		"sans-semibold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
		"sans-extrabold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
	});

	useEffect(() => {
		if (fontsLoaded || fontsError) {
			if (fontsError) {
				logger.error("Failed to load fonts:", fontsError);
			}
			SplashScreen.hideAsync();
		}
	}, [fontsLoaded, fontsError]);

	if (!fontsLoaded && !fontsError) {
		return null;
	}

	if (!publishableKey) return null;

	return (
		<ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
			<Stack screenOptions={{ headerShown: false }} />
		</ClerkProvider>
	);
}
