import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import ExpenseSummaryCard from "@/components/ExpenseSummaryCard";
import ListHeading from "@/components/ListHeading";
import MonthlyBarChart from "@/components/MonthlyBarChart";
import SafeAreaView from "@/components/StyledSafeAreaView";
import SubscriptionCard from "@/components/SubscriptionCard";
import { icons } from "@/constants/icons";
import { colors } from "@/constants/theme";
import { useSubscriptionContext } from "@/context/SubscriptionContext";

const Insights = () => {
	const { subscriptions } = useSubscriptionContext();

	return (
		<SafeAreaView className="flex-1 pt-5 bg-background">
			{/* Header */}
			<View className="flex-row justify-between items-center my-5 px-5">
				<Text className="text-primary text-2xl font-sans-bold">Monthly Insights</Text>
				<TouchableOpacity className="w-10 h-10 bg-background rounded-full items-center justify-center border border-border/10">
					<Image source={icons.menu} className="w-5 h-5" style={{ tintColor: colors.primary }} />
				</TouchableOpacity>
			</View>

			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 20 }}
			>
				{/* Upcoming Section */}
				<View className="mt-4">
					{/* TODO: implement viewAll handler */}
					<ListHeading title="Upcoming" onViewAll={() => {}} />
					<MonthlyBarChart />
				</View>

				{/* Expenses Card */}
				{/* TODO: replace with real expense data from context/API */}
				<ExpenseSummaryCard month="March 2026" amount="-$424.63" growth="+12%" />

				{/* History Section */}
				<View className="mt-8">
					{/* TODO: implement viewAll handler */}
					<ListHeading title="History" onViewAll={() => {}} />
					<View className="flex-col gap-4 mt-4">
						{subscriptions.map((sub: Subscription) => (
							// TODO: implement onPress handler
							<SubscriptionCard key={sub.id} {...sub} expanded={false} onPress={() => {}} />
						))}
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

export default Insights;
