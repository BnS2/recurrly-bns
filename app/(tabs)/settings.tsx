import { useClerk, useUser } from "@clerk/expo";
import { usePostHog } from "posthog-react-native";
import { useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import SafeAreaView from "@/components/StyledSafeAreaView";
import images from "@/constants/images";
import { logger } from "@/lib/logger";

const Settings = () => {
	const { user } = useUser();
	const { signOut } = useClerk();
	const posthog = usePostHog();
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	const handleSignOut = async () => {
		setIsLoggingOut(true);
		try {
			posthog.capture("user_signed_out");
			try {
				await posthog.flush();
				posthog.reset();
			} catch (analyticsError) {
				logger.error("Analytics error during sign out:", analyticsError);
			}
			await signOut();
		} catch (error) {
			logger.error("Error signing out:", error);
			setIsLoggingOut(false);
		}
	};

	return (
		<SafeAreaView className="flex-1 p-5 bg-background">
			<ScrollView showsVerticalScrollIndicator={false}>
				<View className="list-head">
					<Text className="list-title">Settings</Text>
				</View>

				<View className="auth-card mb-4">
					<View className="flex-row items-center gap-4">
						<Image source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar} className="size-16 rounded-full" />
						<View className="flex-1">
							<Text className="font-sans-bold text-xl text-primary">{user?.fullName || "Recurrly User"}</Text>
							<Text className="font-sans-medium text-sm text-muted-foreground mt-1">
								{user?.primaryEmailAddress?.emailAddress}
							</Text>
						</View>
					</View>
				</View>

				<TouchableOpacity
					onPress={handleSignOut}
					disabled={isLoggingOut}
					className={`flex-row items-center justify-center rounded-2xl bg-primary py-4 ${isLoggingOut && "opacity-50"}`}
				>
					{isLoggingOut ? <ActivityIndicator color="#fff" /> : <Text className="auth-button-text">Logout</Text>}
				</TouchableOpacity>
			</ScrollView>
		</SafeAreaView>
	);
};

export default Settings;
