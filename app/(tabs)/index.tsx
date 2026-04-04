import { useUser } from "@clerk/expo";
import dayjs from "dayjs";
import { useCallback, useState } from "react";
import { FlatList, Image, Text, View } from "react-native";
import ListHeading from "@/components/ListHeading";
import SafeAreaView from "@/components/StyledSafeAreaView";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import { HOME_BALANCE, HOME_SUBSCRIPTIONS, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import { formatCurrency } from "@/lib/utils";

const ItemSeparator = () => <View className="h-4" />;

function HomeListHeader() {
	const { user } = useUser();

	return (
		<>
			<View className="home-header">
				<View className="home-user">
					<Image source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar} className="home-avatar" />
					<Text className="home-user-name">
						{user?.firstName || user?.emailAddresses[0].emailAddress.split("@")[0] || "User"}
					</Text>
				</View>

				<Image source={icons.add} className="home-add-icon" />
			</View>

			<View className="home-balance-card">
				<Text className="home-balance-label">Balance</Text>

				<View className="home-balance-row">
					<Text className="home-balance-amount">{formatCurrency(HOME_BALANCE.amount)}</Text>
					<Text className="home-balance-date">{dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}</Text>
				</View>
			</View>

			<View className="mb-5">
				<ListHeading title="Upcoming" />
				<FlatList
					data={UPCOMING_SUBSCRIPTIONS}
					renderItem={({ item }) => <UpcomingSubscriptionCard {...item} />}
					keyExtractor={(item) => item.id}
					horizontal
					showsHorizontalScrollIndicator={false}
					ListEmptyComponent={<Text className="home-empty-state">No upcoming renewals yet.</Text>}
				/>
			</View>
			<ListHeading title="All Subscriptions" />
		</>
	);
}

export default function App() {
	const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);

	const handleSubscriptionPress = useCallback(
		(id: string) => setExpandedSubscriptionId((currentId) => (currentId === id ? null : id)),
		[],
	);

	return (
		<SafeAreaView className="flex-1 p-5 bg-background">
			<FlatList
				ListHeaderComponent={HomeListHeader}
				data={HOME_SUBSCRIPTIONS}
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
				ListEmptyComponent={<Text className="home-empty-state">No subscriptions yet.</Text>}
				contentContainerClassName="pb-30"
			/>
		</SafeAreaView>
	);
}
