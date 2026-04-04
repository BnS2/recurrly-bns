import { Link, useLocalSearchParams } from "expo-router";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// TODO: This route is currently unreachable.
// Add a Link or router.push(`/subscriptions/${id}`) inside SubscriptionCard
// (components/SubscriptionCard.tsx) or its parent in app/(tabs)/index.tsx
// so tapping a card navigates here.
const SubscriptionDetails = () => {
	const { id } = useLocalSearchParams<{ id: string }>();
	return (
		<SafeAreaView>
			<Text>Subscription Details: {id}</Text>
			<Link href="/">Go Back</Link>
		</SafeAreaView>
	);
};

export default SubscriptionDetails;
