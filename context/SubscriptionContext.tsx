import { createContext, type ReactNode, useContext, useState } from "react";
import { HOME_SUBSCRIPTIONS } from "@/constants/data";

interface SubscriptionContextType {
	subscriptions: Subscription[];
	addSubscription: (subscription: Subscription) => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
	const [subscriptions, setSubscriptions] = useState<Subscription[]>(HOME_SUBSCRIPTIONS);

	const addSubscription = (newSub: Subscription) => {
		setSubscriptions((prev) => [newSub, ...prev]);
	};

	return (
		<SubscriptionContext.Provider value={{ subscriptions, addSubscription }}>{children}</SubscriptionContext.Provider>
	);
}

export function useSubscriptionContext() {
	const context = useContext(SubscriptionContext);
	if (context === undefined) {
		throw new Error("useSubscriptionContext must be used within a SubscriptionProvider");
	}
	return context;
}
