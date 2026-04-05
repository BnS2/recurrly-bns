import { useAuth, useSignUp } from "@clerk/expo";
import { type Href, Link, useRouter } from "expo-router";
import { usePostHog } from "posthog-react-native";
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
import { mfaSchema, signUpSchema } from "@/lib/validations";

export default function SignUpScreen() {
	const { signUp, errors, fetchStatus } = useSignUp();
	const { isSignedIn } = useAuth();
	const router = useRouter();
	const posthog = usePostHog();

	const [emailAddress, setEmailAddress] = useState("");
	const [password, setPassword] = useState("");
	const [code, setCode] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [touched, setTouched] = useState({ email: false, password: false, code: false });

	const emailParse = signUpSchema.shape.email.safeParse(emailAddress);
	const isEmailValid = emailParse.success;
	const emailErrorMsg = emailParse.success ? "" : emailParse.error.issues[0].message;

	const passwordParse = signUpSchema.shape.password.safeParse(password);
	const isPasswordValid = passwordParse.success;
	const passwordErrorMsg = passwordParse.success ? "" : passwordParse.error.issues[0].message;

	const codeParse = mfaSchema.shape.code.safeParse(code);
	const isCodeValid = codeParse.success;
	const codeErrorMsg = codeParse.success ? "" : codeParse.error.issues[0].message;

	const handleSubmit = async () => {
		setTouched((prev) => ({ ...prev, email: true, password: true }));
		if (!isEmailValid || !isPasswordValid) return;

		setError(null);
		try {
			const { error: signUpError } = await signUp.password({
				emailAddress,
				password,
			});

			if (signUpError) {
				logger.error("Sign Up Failed:", signUpError);
				posthog.capture("sign_up_failed", { error_code: signUpError.code });
				setError("Something went wrong. Please try again.");
				return;
			}

			const { error: sendError } = await signUp.verifications.sendEmailCode();
			if (sendError) {
				logger.error("Failed to send verification code:", sendError);
				setError(sendError.message || "Failed to send verification code.");
				return;
			}
		} catch (e) {
			logger.error("Sign Up Exception:", e);
			setError("An unexpected error occurred during sign up. Please try again.");
		}
	};

	const handleVerify = async () => {
		setTouched((prev) => ({ ...prev, code: true }));
		if (!isCodeValid) return;

		setError(null);
		try {
			const { error: verifyError } = await signUp.verifications.verifyEmailCode({
				code,
			});

			if (verifyError) {
				logger.error("Verification Failed:", verifyError);
				setError(verifyError.message || "The code you entered is incorrect.");
				return;
			}

			if (signUp.status === "complete") {
				await signUp.finalize({
					navigate: ({ decorateUrl, session }) => {
						posthog.identify(session?.user?.id ?? emailAddress, {
							$set: { email: emailAddress },
							$set_once: { sign_up_date: new Date().toISOString() },
						});
						posthog.capture("user_signed_up", { method: "password" });
						if (session?.currentTask?.key) {
							const taskMap: Record<string, string> = {
								"choose-organization": "/(tabs)/select-org",
								"reset-password": "/(auth)/reset-password",
								"setup-mfa": "/(auth)/mfa-setup",
							};
							const taskRoute = taskMap[session.currentTask.key] || "/(auth)/task-recovery";
							const url = decorateUrl(taskRoute);
							router.replace(url as Href);
						} else {
							const url = decorateUrl("/(tabs)");
							router.replace(url as Href);
						}
					},
				});
			} else {
				logger.error("Sign-up not complete:", signUp);
				setError(
					"Verification succeeded but your sign-up is not complete; please check for additional required steps or contact support.",
				);
			}
		} catch (e) {
			logger.error("Verification Exception:", e);
			setError("An unexpected error occurred during verification. Please try again.");
		}
	};

	if (signUp.status === "complete" || isSignedIn) {
		return null;
	}

	const isLoading = fetchStatus === "fetching";

	if (
		signUp.status === "missing_requirements" &&
		signUp.unverifiedFields.includes("email_address") &&
		signUp.missingFields.length === 0
	) {
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
								<Text className="auth-title">Verify your account</Text>
								<Text className="auth-subtitle">
									{"We've sent a 6-digit code to "}
									{emailAddress}
								</Text>
							</View>

							<View className="auth-card">
								<View className="auth-form">
									<View className="auth-field">
										<Text className="auth-label">Verification Code</Text>
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
										className={`auth-button ${isLoading && "auth-button-disabled"}`}
										onPress={handleVerify}
										disabled={isLoading}
										activeOpacity={0.8}
									>
										{isLoading ? (
											<ActivityIndicator color="#081126" />
										) : (
											<Text className="auth-button-text-on-accent">Verify</Text>
										)}
									</TouchableOpacity>

									<TouchableOpacity
										className="auth-secondary-button mt-2"
										onPress={async () => {
											setError(null);
											try {
												const { error: resendError } = await signUp.verifications.sendEmailCode();
												if (resendError) {
													logger.error("Resend Failed:", resendError);
													setError(resendError.message || "Failed to resend code.");
												} else {
													posthog.capture("email_verification_resent");
												}
											} catch (e) {
												logger.error("Resend Exception:", e);
												setError("An unexpected error occurred while resending the code.");
											}
										}}
										disabled={isLoading}
									>
										<Text className="auth-secondary-button-text">Resend Code</Text>
									</TouchableOpacity>

									<TouchableOpacity
										className="auth-secondary-button mt-2"
										onPress={async () => {
											await signUp.reset();
											setCode("");
											setError(null);
											setTouched((prev) => ({ ...prev, code: false }));
										}}
										disabled={isLoading}
									>
										<Text className="auth-secondary-button-text text-primary/60">Use a different email</Text>
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
							<Text className="auth-title">Create account</Text>
							<Text className="auth-subtitle">Join Recurrly to manage your subscriptions with ease</Text>
						</View>

						<View className="auth-card">
							<View className="auth-form">
								<View className="auth-field">
									<Text className="auth-label">Email address</Text>
									<TextInput
										className={`auth-input ${((touched.email && !isEmailValid) || error || errors.fields.emailAddress) && "auth-input-error"}`}
										autoCapitalize="none"
										value={emailAddress}
										placeholder="Enter email"
										placeholderTextColor="rgba(0,0,0,0.3)"
										onChangeText={setEmailAddress}
										onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
										keyboardType="email-address"
									/>
									{touched.email && !isEmailValid ? (
										<Text className="auth-error">{emailErrorMsg}</Text>
									) : errors.fields.emailAddress ? (
										<Text className="auth-error">{errors.fields.emailAddress.message}</Text>
									) : null}
								</View>

								<View className="auth-field">
									<Text className="auth-label">Password</Text>
									<TextInput
										className={`auth-input ${((touched.password && !isPasswordValid) || (error && !errors.fields.emailAddress) || errors.fields.password) && "auth-input-error"}`}
										value={password}
										placeholder="Enter password"
										placeholderTextColor="rgba(0,0,0,0.3)"
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

								{!errors.fields.emailAddress && !errors.fields.password && error && (
									<Text className="auth-error">{error}</Text>
								)}

								<TouchableOpacity
									className={`auth-button ${isLoading && "auth-button-disabled"}`}
									onPress={handleSubmit}
									disabled={isLoading}
									activeOpacity={0.8}
								>
									{isLoading ? (
										<ActivityIndicator color="#081126" />
									) : (
										<Text className="auth-button-text-on-accent">Sign Up</Text>
									)}
								</TouchableOpacity>
							</View>
						</View>

						<View className="auth-link-row">
							<Text className="auth-link-copy">Already have an account?</Text>
							<Link href="/(auth)/sign-in">
								<Text className="auth-link">Sign in</Text>
							</Link>
						</View>

						<View nativeID="clerk-captcha" />
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
