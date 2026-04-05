import { clsx } from "clsx";
import dayjs from "dayjs";
import { usePostHog } from "posthog-react-native";
import { useEffect, useRef, useState } from "react";
import {
	ActivityIndicator,
	Image,
	KeyboardAvoidingView,
	Modal,
	Platform,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from "react-native";
import { icons } from "@/constants/icons";
import { subscriptionSchema } from "@/lib/validations";

interface CreateSubscriptionModalProps {
	visible: boolean;
	onClose: () => void;
	onAdd: (subscription: Subscription) => void;
}

const CATEGORIES = [
	"Entertainment",
	"AI Tools",
	"Developer Tools",
	"Design",
	"Productivity",
	"Cloud",
	"Music",
	"Other",
] as const;

type Category = (typeof CATEGORIES)[number];

const CATEGORY_COLORS: Record<Category, string> = {
	Entertainment: "#f5c542",
	"AI Tools": "#b8d4e3",
	"Developer Tools": "#e8def8",
	Design: "#b8e8d0",
	Productivity: "#ffd1dc",
	Cloud: "#d1e9ff",
	Music: "#d4edda",
	Other: "#e2e3e5",
};

const APP_ICON_MAP: Record<string, keyof typeof icons> = {
	spotify: "spotify",
	notion: "notion",
	dropbox: "dropbox",
	openai: "openai",
	chatgpt: "openai",
	adobe: "adobe",
	photoshop: "adobe",
	illustrator: "adobe",
	medium: "medium",
	figma: "figma",
	github: "github",
	claude: "claude",
	canva: "canva",
};

function getAppIcon(name: string) {
	const lowerName = name.toLowerCase().trim();
	for (const [key, icon] of Object.entries(APP_ICON_MAP)) {
		if (lowerName.includes(key)) {
			return icons[icon];
		}
	}
	return icons.wallet;
}

export default function CreateSubscriptionModal({ visible, onClose, onAdd }: CreateSubscriptionModalProps) {
	const posthog = usePostHog();
	const [name, setName] = useState("");
	const [price, setPrice] = useState("");
	const [frequency, setFrequency] = useState<"Monthly" | "Yearly">("Monthly");
	const [category, setCategory] = useState<Category>("Entertainment");

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [touched, setTouched] = useState({ name: false, price: false });
	const submitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (submitTimeoutRef.current) {
				clearTimeout(submitTimeoutRef.current);
			}
		};
	}, []);

	const validation = subscriptionSchema.safeParse({
		name,
		price,
		billing: frequency,
		category,
	});

	const getFieldError = (field: "name" | "price") => {
		if (!touched[field] || validation.success) return null;
		const error = validation.error.issues.find((issue) => issue.path.includes(field));
		return error ? error.message : null;
	};

	const isValid = validation.success && !isSubmitting;

	const handleSubmit = async () => {
		if (!validation.success || isSubmitting) return;

		setIsSubmitting(true);
		const {
			name: validatedName,
			price: priceValue,
			billing: validatedBilling,
			category: validatedCategory,
		} = validation.data;
		const now = dayjs();
		const renewalDate = now.add(1, frequency === "Monthly" ? "month" : "year");

		const newSubscription: Subscription = {
			id: Math.random().toString(36).substring(2, 9),
			name: validatedName,
			price: priceValue,
			billing: validatedBilling,
			category: validatedCategory,
			status: "active",
			startDate: now.toISOString(),
			renewalDate: renewalDate.toISOString(),
			icon: getAppIcon(validatedName),
			color: CATEGORY_COLORS[category],
			currency: "USD",
		};

		posthog.capture("subscription_created", {
			subscription_name: validatedName,
			subscription_price: priceValue,
			subscription_frequency: validatedBilling,
			subscription_category: validatedCategory,
		});

		// Brief delay for UX feedback
		submitTimeoutRef.current = setTimeout(() => {
			onAdd(newSubscription);
			handleClose();
			setIsSubmitting(false);
			submitTimeoutRef.current = null;
		}, 600);
	};

	const handleClose = () => {
		if (submitTimeoutRef.current) {
			clearTimeout(submitTimeoutRef.current);
			submitTimeoutRef.current = null;
		}
		setName("");
		setPrice("");
		setFrequency("Monthly");
		setCategory("Entertainment");
		setTouched({ name: false, price: false });
		onClose();
	};

	return (
		<Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
			<View className="modal-overlay">
				<Pressable className="flex-1" onPress={handleClose} />
				<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="modal-container">
					<View className="modal-header">
						<Text className="modal-title">New Subscription</Text>
						<Pressable
							onPress={handleClose}
							className="modal-close"
							style={({ pressed }) => ({
								opacity: pressed ? 0.6 : 1,
								transform: [{ scale: pressed ? 0.92 : 1 }],
							})}
						>
							<Image
								source={icons.plus}
								className="size-5"
								style={{ transform: [{ rotate: "45deg" }] }}
								tintColor="#081126"
							/>
						</Pressable>
					</View>

					<ScrollView className="modal-body" showsVerticalScrollIndicator={false}>
						<View className="auth-field">
							<Text className="auth-label">Name</Text>
							<TextInput
								className={clsx("auth-input", getFieldError("name") && "auth-input-error")}
								placeholder="Netflix, Spotify, etc."
								value={name}
								onChangeText={setName}
								onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
								placeholderTextColor="rgba(8, 17, 38, 0.4)"
							/>
							{getFieldError("name") && <Text className="auth-error mb-2">{getFieldError("name")}</Text>}
						</View>

						<View className="auth-field mt-4">
							<Text className="auth-label">Price</Text>
							<TextInput
								className={clsx("auth-input", getFieldError("price") && "auth-input-error")}
								placeholder="0.00"
								keyboardType="decimal-pad"
								value={price}
								onChangeText={setPrice}
								onBlur={() => setTouched((prev) => ({ ...prev, price: true }))}
								placeholderTextColor="rgba(8, 17, 38, 0.4)"
							/>
							{getFieldError("price") && <Text className="auth-error mb-2">{getFieldError("price")}</Text>}
						</View>

						<View className="auth-field mt-4">
							<Text className="auth-label">Frequency</Text>
							<View className="picker-row">
								<Pressable
									onPress={() => setFrequency("Monthly")}
									className={clsx("picker-option", frequency === "Monthly" && "picker-option-active")}
								>
									<Text className={clsx("picker-option-text", frequency === "Monthly" && "picker-option-text-active")}>
										Monthly
									</Text>
								</Pressable>
								<Pressable
									onPress={() => setFrequency("Yearly")}
									className={clsx("picker-option", frequency === "Yearly" && "picker-option-active")}
								>
									<Text className={clsx("picker-option-text", frequency === "Yearly" && "picker-option-text-active")}>
										Yearly
									</Text>
								</Pressable>
							</View>
						</View>

						<View className="auth-field mt-4">
							<Text className="auth-label">Category</Text>
							<View className="category-scroll">
								{CATEGORIES.map((cat) => (
									<Pressable
										key={cat}
										onPress={() => setCategory(cat)}
										className={clsx("category-chip", category === cat && "category-chip-active")}
									>
										<Text className={clsx("category-chip-text", category === cat && "category-chip-text-active")}>
											{cat}
										</Text>
									</Pressable>
								))}
							</View>
						</View>

						<Pressable
							onPress={handleSubmit}
							disabled={!isValid || isSubmitting}
							style={({ pressed }) => ({
								opacity: pressed || isSubmitting ? 0.7 : 1,
							})}
							className={clsx("auth-button mt-10 mb-10", (!isValid || isSubmitting) && "auth-button-disabled")}
						>
							{isSubmitting ? (
								<ActivityIndicator color="#081126" />
							) : (
								<Text className="auth-button-text-on-accent">Create Subscription</Text>
							)}
						</Pressable>
					</ScrollView>
				</KeyboardAvoidingView>
			</View>
		</Modal>
	);
}
