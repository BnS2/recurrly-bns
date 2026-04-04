import { z } from "zod";

export const signInSchema = z.object({
	email: z.email("Please enter a valid email address."),
	password: z.string().min(1, "Password cannot be empty."),
});

export const signUpSchema = signInSchema.extend({
	password: z.string().min(8, "Password must be at least 8 characters."),
});

export const mfaSchema = z.object({
	code: z.string().length(6, "Please enter a 6-digit code."),
});
