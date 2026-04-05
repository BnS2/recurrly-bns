import "@/global.css";
import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, useGlobalSearchParams, usePathname } from "expo-router";
import { PostHogProvider } from "posthog-react-native";
import { useEffect, useRef } from "react";
import { logger } from "@/lib/logger";
import { posthog } from "@/lib/posthog";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
	throw new Error("Add your Clerk Publishable Key (EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY) to the .env.local file");
}

export const unstable_settings = {
	initialRouteName: "(tabs)",
};

export default function RootLayout() {
	const pathname = usePathname();
	const params = useGlobalSearchParams();
	const previousPathname = useRef<string | undefined>(undefined);

	useEffect(() => {
		if (previousPathname.current !== pathname) {
			posthog.screen(pathname, {
				previous_screen: previousPathname.current ?? null,
				...params,
			});
			previousPathname.current = pathname;
		}
	}, [pathname, params]);

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
		<PostHogProvider
			client={posthog}
			autocapture={{
				captureScreens: false,
				captureTouches: true,
				propsToCapture: ["testID"],
			}}
		>
			<ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
				<Stack screenOptions={{ headerShown: false }} />
			</ClerkProvider>
		</PostHogProvider>
	);
}
