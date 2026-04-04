import { useAuth, useSignUp } from "@clerk/expo";
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
import { mfaSchema, signUpSchema } from "@/lib/validations";

export default function SignUpScreen() {
	const { signUp, errors, fetchStatus } = useSignUp();
	const { isSignedIn } = useAuth();
	const router = useRouter();

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
		const { error: signUpError } = await signUp.password({
			emailAddress,
			password,
		});

		if (signUpError) {
			logger.error("Sign Up Failed:", signUpError);
			setError(signUpError.message || "Failed to create account. Please try again.");
			return;
		}

		await signUp.verifications.sendEmailCode();
	};

	const handleVerify = async () => {
		setTouched((prev) => ({ ...prev, code: true }));
		if (!isCodeValid) return;

		setError(null);
		await signUp.verifications.verifyEmailCode({
			code,
		});

		if (signUp.status === "complete") {
			await signUp.finalize({
				navigate: ({ decorateUrl, session }) => {
					if (session?.currentTask) {
						const url = decorateUrl(`/(tabs)?task=${session.currentTask}`);
						router.replace(url as Href);
					} else {
						const url = decorateUrl("/(tabs)");
						router.replace(url as Href);
					}
				},
			});
		} else {
			logger.error("Sign-up attempt not complete:", signUp);
			setError("The code you entered is incorrect. Please double-check and try again.");
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
										{(touched.code && !isCodeValid) ? (
											<Text className="auth-error text-center">{codeErrorMsg}</Text>
										) : (error || errors.fields.code) ? (
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
											<Text className="auth-button-text">Verify</Text>
										)}
									</TouchableOpacity>

									<TouchableOpacity
										className="auth-secondary-button mt-2"
										onPress={() => signUp.verifications.sendEmailCode()}
										disabled={isLoading}
									>
										<Text className="auth-secondary-button-text">Resend Code</Text>
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
									{(touched.email && !isEmailValid) ? (
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
									{(touched.password && !isPasswordValid) ? (
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
										<Text className="auth-button-text">Sign Up</Text>
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
