import { Link } from "expo-router";
import { Text } from "react-native";
import SafeAreaView from "@/components/StyledSafeAreaView";

const SignUp = () => {
	return (
		<SafeAreaView>
			<Text>SignUp</Text>
			<Link href="/(auth)/sign-in">Already have an account?</Link>
		</SafeAreaView>
	);
};

export default SignUp;
