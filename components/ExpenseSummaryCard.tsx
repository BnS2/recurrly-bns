import { View, Text } from "react-native";

interface ExpenseSummaryCardProps {
	month: string;
	amount: string;
	growth: string;
}

const ExpenseSummaryCard = ({ month, amount, growth }: ExpenseSummaryCardProps) => {
	return (
		<View className="bg-card p-5 rounded-3xl border border-border/50 mt-4 flex-row justify-between items-center">
			<View>
				<Text className="text-primary text-xl font-semibold">Expenses</Text>
				<Text className="text-muted-foreground mt-1">{month}</Text>
			</View>
			<View className="items-end">
				<Text className="text-primary text-xl font-bold">{amount}</Text>
				<Text className="text-muted-foreground mt-1">{growth}</Text>
			</View>
		</View>
	);
};

export default ExpenseSummaryCard;
