import { Stack } from "expo-router";

// TODO: Auth routing is currently scaffolded.
// Before shipping, the root layout (_layout.tsx) should perform an auth-state
// check (e.g. a hook that reads currentUser/isAuthenticated) and
// conditionally redirect unauthenticated users here via
// router.replace("/(auth)/sign-in") instead of always initialising on "(tabs)".
// Reference: unstable_settings.initialRouteName in app/_layout.tsx.
export default function AuthLayout() {
	return <Stack screenOptions={{ headerShown: false }} />;
}
