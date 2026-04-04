import { Text, View } from "react-native";

// TODO: Implement onboarding UI and navigation.
// This screen is not yet reachable from any layout (root initialRouteName is
// "(tabs)"). Wire it up in app/_layout.tsx or expose it as a first-run flow
// before the main tab navigator is shown.
const Onboarding = () => {
	return (
		<View>
			<Text>onboarding</Text>
		</View>
	);
};

export default Onboarding;
