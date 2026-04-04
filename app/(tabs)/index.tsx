import { Link } from "expo-router";
import { Text } from "react-native";
import SafeAreaView from "@/components/StyledSafeAreaView";

export default function App() {
	return (
		<SafeAreaView className="flex-1 p-5 bg-background">
			<Text className="text-5xl text-primary font-sans-extrabold">Home</Text>

			<Link href="/onboarding" className="mt-4 font-sans-bold rounded bg-primary p-4 text-white">
				Go to Onboarding
			</Link>
			<Link href="/(auth)/sign-in" className="mt-4 font-sans-bold rounded bg-primary p-4 text-white">
				Go to Sign in
			</Link>
			<Link href="/(auth)/sign-up" className="mt-4 font-sans-bold rounded bg-primary p-4 text-white">
				Go to Sign up
			</Link>
		</SafeAreaView>
	);
}
