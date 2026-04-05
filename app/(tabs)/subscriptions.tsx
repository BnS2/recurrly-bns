import { usePostHog } from "posthog-react-native";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Text, TextInput, View } from "react-native";
import ListHeading from "@/components/ListHeading";
import SafeAreaView from "@/components/StyledSafeAreaView";
import SubscriptionCard from "@/components/SubscriptionCard";
import { useSubscriptionContext } from "@/context/SubscriptionContext";

const ItemSeparator = () => <View className="h-4" />;

const Subscriptions = () => {
	const posthog = usePostHog();
	const { subscriptions } = useSubscriptionContext();
	const [searchQuery, setSearchQuery] = useState("");
	const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);

	const filteredSubscriptions = useMemo(() => {
		const normalizedQuery = searchQuery?.trim().toLowerCase();
		if (!normalizedQuery) return subscriptions;

		return subscriptions.filter((sub) => {
			return (
				sub.name.toLowerCase().includes(normalizedQuery) ||
				sub.category?.toLowerCase().includes(normalizedQuery) ||
				sub.plan?.toLowerCase().includes(normalizedQuery)
			);
		});
	}, [searchQuery, subscriptions]);

	const handleSubscriptionPress = useCallback(
		(id: string) => {
			const isExpanding = expandedSubscriptionId !== id;
			posthog.capture(isExpanding ? "subscription_expanded" : "subscription_collapsed", {
				subscription_id: id,
			});
			setExpandedSubscriptionId(isExpanding ? id : null);
		},
		[expandedSubscriptionId, posthog],
	);

	return (
		<SafeAreaView className="flex-1 pt-5 bg-background">
			<View className="px-5">
				<ListHeading title="Subscriptions" />

				<View className="mb-5 px-4 py-3 bg-card rounded-2xl border border-border">
					<TextInput
						placeholder="Search subscriptions..."
						placeholderTextColor="#A0A0A0"
						className="text-primary text-base font-medium"
						value={searchQuery}
						onChangeText={setSearchQuery}
					/>
				</View>
			</View>

			<FlatList
				data={filteredSubscriptions}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<SubscriptionCard
						{...item}
						expanded={expandedSubscriptionId === item.id}
						onPress={() => handleSubscriptionPress(item.id)}
					/>
				)}
				extraData={expandedSubscriptionId}
				ItemSeparatorComponent={ItemSeparator}
				showsVerticalScrollIndicator={false}
				ListEmptyComponent={<Text className="home-empty-state">No subscriptions found.</Text>}
				contentContainerClassName="px-5 pb-30"
				keyboardDismissMode="on-drag"
				keyboardShouldPersistTaps="handled"
				className="flex-1"
			/>
		</SafeAreaView>
	);
};

export default Subscriptions;
