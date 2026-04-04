import dayjs from "dayjs";
import { logger } from "./logger";

export function formatCurrency(value: unknown, currency: string = "USD"): string {
	try {
		const numericValue = typeof value === "string" ? parseFloat(value) : Number(value);

		if (Number.isNaN(numericValue)) {
			return formatZero(currency);
		}

		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: currency,
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(numericValue);
	} catch (error: unknown) {
		if (error instanceof Error) {
			logger.error(`Currency formatting error: ${error.message}`);
		} else {
			logger.error("Unknown currency formatting error", error);
		}
		// Fallback if Intl.NumberFormat fails or any other error
		return formatZero(currency);
	}
}

function formatZero(currency: string): string {
	try {
		return new Intl.NumberFormat(undefined, {
			style: "currency",
			currency: currency,
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(0);
	} catch {
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
