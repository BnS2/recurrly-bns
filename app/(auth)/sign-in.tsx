import { useSignIn } from "@clerk/expo";
import { type Href, Link, useRouter } from "expo-router";
import { useState } from "react";
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import SafeAreaView from "@/components/StyledSafeAreaView";
import { logger } from "@/lib/logger";
import { mfaSchema, signInSchema } from "@/lib/validations";

export default function SignInScreen() {
	const { signIn, errors, fetchStatus } = useSignIn();
	const router = useRouter();

	const [emailAddress, setEmailAddress] = useState("");
	const [password, setPassword] = useState("");
	const [code, setCode] = useState("");
	const [isVerifyingMfa, setIsVerifyingMfa] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [touched, setTouched] = useState({ email: false, password: false, code: false });

	const emailParse = signInSchema.shape.email.safeParse(emailAddress);
	const isEmailValid = emailParse.success;
	const emailErrorMsg = emailParse.success ? "" : emailParse.error.issues[0].message;

	const passwordParse = signInSchema.shape.password.safeParse(password);
	const isPasswordValid = passwordParse.success;
	const passwordErrorMsg = passwordParse.success ? "" : passwordParse.error.issues[0].message;

	const codeParse = mfaSchema.shape.code.safeParse(code);
	const isCodeValid = codeParse.success;
	const codeErrorMsg = codeParse.success ? "" : codeParse.error.issues[0].message;

	const onSignInPress = async () => {
		setTouched((prev) => ({ ...prev, email: true, password: true }));
		if (!isEmailValid || !isPasswordValid) return;

		setError(null);

		const { error: signInError } = await signIn.password({
			emailAddress,
			password,
		});

		if (signInError) {
			logger.error("Sign In Failed:", signInError);
			setError(signInError.message || "Something went wrong. Please try again.");
			return;
		}

		handleSignInStatus();
	};

	const handleVerifyMfa = async () => {
		setTouched((prev) => ({ ...prev, code: true }));
		if (!isCodeValid) return;

		setError(null);

		const factor = signIn.supportedSecondFactors.find(
			(f) =>
				f.strategy === "email_code" ||
				f.strategy === "phone_code" ||
				f.strategy === "totp" ||
				f.strategy === "backup_code",
		);

		if (!factor) {
			setError("No supported verification method found.");
			return;
		}

		let result: { error?: unknown } | undefined;
		if (factor.strategy === "email_code") {
			result = await signIn.mfa.verifyEmailCode({ code });
		} else if (factor.strategy === "phone_code") {
			result = await signIn.mfa.verifyPhoneCode({ code });
		} else if (factor.strategy === "totp") {
			result = await signIn.mfa.verifyTOTP({ code });
		} else if (factor.strategy === "backup_code") {
			result = await signIn.mfa.verifyBackupCode({ code });
		}

		if (result?.error) {
			setError("The code you entered is incorrect. Please double-check and try again.");
			return;
		}

		handleSignInStatus();
	};

	const handleSignInStatus = async () => {
		if (signIn.status === "complete") {
			await signIn.finalize({
				navigate: ({ decorateUrl, session }) => {
					if (session?.currentTask) {
						// Branch to specific task-handling routes if needed
						// For now, we still use decorateUrl but prioritize the task-aware path
						const url = decorateUrl(`/(tabs)?task=${session.currentTask}`);
						router.replace(url as Href);
					} else {
						const url = decorateUrl("/(tabs)");
						router.replace(url as Href);
					}
				},
			});
		} else if (signIn.status === "needs_second_factor" || signIn.status === "needs_client_trust") {
			setIsVerifyingMfa(true);
			// For simplicity, we send the code to email if it's a supported strategy
			const emailCodeFactor = signIn.supportedSecondFactors.find((factor) => factor.strategy === "email_code");
			if (emailCodeFactor) {
				await signIn.mfa.sendEmailCode();
			}
		} else {
			logger.error("Sign-in attempt not complete:", signIn);
			setError("Sign-in incomplete. Please check your credentials.");
		}
	};

	const isLoading = fetchStatus === "fetching";

	if (isVerifyingMfa) {
		return (
			<SafeAreaView className="auth-safe-area">
				<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
					<ScrollView contentContainerStyle={{ flexGrow: 1 }} className="auth-scroll">
						<View className="auth-content">
							<View className="auth-brand-block">
								<View className="auth-logo-wrap">
									<View className="auth-logo-mark">
										<Text className="auth-logo-mark-text">R</Text>
									</View>
									<View>
										<Text className="auth-wordmark">Recurrly</Text>
										<Text className="auth-wordmark-sub">SMART BILLING</Text>
									</View>
								</View>
							</View>

							<View className="mt-4 items-center">
								<Text className="auth-title">{"Verify it's you"}</Text>
								<Text className="auth-subtitle">Final step: Enter the 6-digit code sent to your email.</Text>
							</View>

							<View className="auth-card">
								<View className="auth-form">
									<View className="auth-field">
										<Text className="auth-label">MFA Code</Text>
										<TextInput
											style={{ letterSpacing: 8, textAlign: "center" }}
											className={`auth-input text-3xl py-6 ${((touched.code && !isCodeValid) || error || errors.fields.code) && "auth-input-error"}`}
											value={code}
											placeholder="000000"
											placeholderTextColor="rgba(0,0,0,0.3)"
											onChangeText={setCode}
											onBlur={() => setTouched((prev) => ({ ...prev, code: true }))}
											keyboardType="numeric"
											maxLength={6}
										/>
										{touched.code && !isCodeValid ? (
											<Text className="auth-error text-center">{codeErrorMsg}</Text>
										) : error || errors.fields.code ? (
											<Text className="auth-error text-center">{error || errors.fields.code?.message}</Text>
										) : null}
									</View>

									<TouchableOpacity
										onPress={handleVerifyMfa}
										className={`auth-button ${isLoading && "auth-button-disabled"}`}
										activeOpacity={0.8}
										disabled={isLoading}
									>
										{isLoading ? (
											<ActivityIndicator color="#081126" />
										) : (
											<Text className="auth-button-text">Verify & Sign In</Text>
										)}
									</TouchableOpacity>

									<TouchableOpacity
										className="auth-secondary-button mt-2"
										onPress={() => {
											signIn.reset();
											setIsVerifyingMfa(false);
										}}
										disabled={isLoading}
									>
										<Text className="auth-secondary-button-text">Go back</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					</ScrollView>
				</KeyboardAvoidingView>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="auth-safe-area">
			<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
				<ScrollView contentContainerStyle={{ flexGrow: 1 }} className="auth-scroll">
					<View className="auth-content">
						<View className="auth-brand-block">
							<View className="auth-logo-wrap">
								<View className="auth-logo-mark">
									<Text className="auth-logo-mark-text">R</Text>
								</View>
								<View>
									<Text className="auth-wordmark">Recurrly</Text>
									<Text className="auth-wordmark-sub">SMART BILLING</Text>
								</View>
							</View>
						</View>

						<View className="mt-4 items-center">
							<Text className="auth-title">Welcome back</Text>
							<Text className="auth-subtitle">Sign in to continue managing your subscriptions</Text>
						</View>

						<View className="auth-card">
							<View className="auth-form">
								<View className="auth-field">
									<Text className="auth-label">Email</Text>
									<TextInput
										autoCapitalize="none"
										value={emailAddress}
										placeholder="Enter your email"
										placeholderTextColor="rgba(0,0,0,0.3)"
										className={`auth-input ${((touched.email && !isEmailValid) || error || errors.fields.identifier) && "auth-input-error"}`}
										onChangeText={setEmailAddress}
										onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
										keyboardType="email-address"
									/>
									{touched.email && !isEmailValid ? (
										<Text className="auth-error">{emailErrorMsg}</Text>
									) : errors.fields.identifier ? (
										<Text className="auth-error">{errors.fields.identifier.message}</Text>
									) : null}
								</View>

								<View className="auth-field">
									<Text className="auth-label">Password</Text>
									<TextInput
										value={password}
										placeholder="Enter your password"
										placeholderTextColor="rgba(0,0,0,0.3)"
										className={`auth-input ${((touched.password && !isPasswordValid) || (error && !errors.fields.identifier) || errors.fields.password) && "auth-input-error"}`}
										secureTextEntry={true}
										onChangeText={setPassword}
										onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
									/>
									{touched.password && !isPasswordValid ? (
										<Text className="auth-error">{passwordErrorMsg}</Text>
									) : errors.fields.password ? (
										<Text className="auth-error">{errors.fields.password.message}</Text>
									) : null}
								</View>

								{!errors.fields.identifier && !errors.fields.password && error && (
									<Text className="auth-error">{error}</Text>
								)}

								<TouchableOpacity
									onPress={onSignInPress}
									className={`auth-button ${isLoading && "auth-button-disabled"}`}
									activeOpacity={0.8}
									disabled={isLoading}
								>
									{isLoading ? (
										<ActivityIndicator color="#081126" />
									) : (
										<Text className="auth-button-text">Sign In</Text>
									)}
								</TouchableOpacity>
							</View>
						</View>

						<View className="auth-link-row">
							<Text className="auth-link-copy">New to Recurrly?</Text>
							<Link href="/(auth)/sign-up">
								<Text className="auth-link">Create an account</Text>
							</Link>
						</View>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
