<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into your Recurrly Expo app. Here is a summary of all changes made:

- **`app.config.js`** (new): Created to expose `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` from `.env` via `Constants.expoConfig.extra`, replacing the static `app.json` at build time.
- **`lib/posthog.ts`** (new): PostHog client singleton configured from `expo-constants`, with batching, retry, and feature flag settings. Disabled gracefully if the token is not set.
- **`app/_layout.tsx`**: Added `PostHogProvider` wrapping the app, plus manual screen tracking via `usePathname` + `useGlobalSearchParams` for expo-router compatibility.
- **`app/(auth)/sign-in.tsx`**: Added `posthog.identify()` and `posthog.capture()` calls for sign-in success, failure, MFA start, and MFA failure.
- **`app/(auth)/sign-up.tsx`**: Added `posthog.identify()` and `posthog.capture()` calls for sign-up success, sign-up failure, and email verification resend.
- **`app/(tabs)/settings.tsx`**: Added `posthog.capture()` + `posthog.reset()` on sign-out.
- **`app/(tabs)/index.tsx`**: Added `posthog.capture()` for subscription card expand and collapse interactions.
- **`.env`**: Created with `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` (`.gitignore` coverage ensured).
- Packages installed: `posthog-react-native`, `react-native-svg`.

## Events

| Event | Description | File |
|-------|-------------|------|
| `user_signed_in` | User successfully completes the sign-in flow | `app/(auth)/sign-in.tsx` |
| `sign_in_failed` | User's sign-in attempt failed | `app/(auth)/sign-in.tsx` |
| `mfa_verification_started` | MFA challenge triggered after password entry | `app/(auth)/sign-in.tsx` |
| `mfa_verification_failed` | User submitted an incorrect MFA code | `app/(auth)/sign-in.tsx` |
| `user_signed_up` | User completed account creation and email verification | `app/(auth)/sign-up.tsx` |
| `sign_up_failed` | Account creation failed during sign-up | `app/(auth)/sign-up.tsx` |
| `email_verification_resent` | User requested a new verification code | `app/(auth)/sign-up.tsx` |
| `user_signed_out` | User signed out from the settings screen | `app/(tabs)/settings.tsx` |
| `subscription_expanded` | User tapped a subscription card to expand it | `app/(tabs)/index.tsx` |
| `subscription_collapsed` | User tapped an expanded subscription card to collapse it | `app/(tabs)/index.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://us.posthog.com/project/369822/dashboard/1432406
- **Sign-up conversion funnel** (sign-up → subscription engagement): https://us.posthog.com/project/369822/insights/y4raCnP8
- **Sign-in: success vs failure** (daily trend): https://us.posthog.com/project/369822/insights/DtFF7gpF
- **Sign-up: success vs failure** (daily trend): https://us.posthog.com/project/369822/insights/rq6D5OLX
- **User churn: sign-outs over time**: https://us.posthog.com/project/369822/insights/lx5IAsfC
- **Return user funnel** (sign-in → subscription engagement): https://us.posthog.com/project/369822/insights/ko0A5oqX

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
