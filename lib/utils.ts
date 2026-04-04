import dayjs from "dayjs";

export function formatCurrency(value: unknown, currency: string = "USD"): string {
	try {
		const numericValue = typeof value === "string" ? parseFloat(value) : Number(value);

		if (Number.isNaN(numericValue) || typeof numericValue !== "number") {
			return "$0.00";
		}

		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: currency,
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(numericValue);
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error(`Currency formatting error: ${error.message}`);
		} else {
			console.error("Unknown currency formatting error", error);
		}
		// Fallback if Intl.NumberFormat fails or any other error
		return "$0.00";
	}
}

export function formatSubscriptionDateTime(value?: string): string {
	if (!value) return "-";

	const date = dayjs(value);
	return date.isValid() ? date.format("MMM DD, YYYY") : "-";
}

export function formatStatusLabel(value?: string): string {
	if (!value) return "-";
	return value.charAt(0).toUpperCase() + value.slice(1);
}
