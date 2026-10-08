# JobPrimed deployment

## Vercel

- Deploy the existing `ayobamiatanda38-del/jobblossom-cvs` repository, branch `main`.
- Set `NITRO_PRESET=vercel` in the Vercel environment before building.
- Build command: `bun run build`. Use the Nitro Vercel output, not a static-only `dist` deployment.
- Keep the existing authentication environment and add the production domain to the authentication redirect allowlist. Do not replace existing authentication configuration with this preview's values.
- AI features outside Lovable require the server-only `OPENAI_API_KEY` unless a valid Lovable AI configuration is already present.

## Payments

- Add the Nigerian merchant's `PAYSTACK_SECRET_KEY_NG` as a server-only environment variable. Existing `PAYSTACK_SECRET_KEY` also remains supported for Nigeria.
- The Nigerian account is the only account currently indicated as ready by the owner. Other markets remain unavailable until their merchant configurations are supplied.
- USD checkout requires a Paystack merchant account approved for USD settlement; accepting an international card does not alone enable USD settlement.
- Country-specific keys for future activation: `PAYSTACK_SECRET_KEY_GH`, `PAYSTACK_SECRET_KEY_ZA`, `PAYSTACK_SECRET_KEY_KE`, `PAYSTACK_SECRET_KEY_CI`, `PAYSTACK_SECRET_KEY_US`.
- Apply `drizzle/migrations/0001_cv_payment_entitlements.sql` to the deployment's existing backend before enabling purchases. It grants authenticated users read-only access to their own purchases and reserves writes for the server.
- If newsletter preferences are not yet present, apply `drizzle/migrations/0000_marketing_preferences.sql` first. Check existing tables before reapplying migrations.
- Live payment and entitlement checks need a signed-in user and the configured merchant key. No live payment is claimed until those checks pass.

Never commit secret keys or `.env` files. GitHub delivery does not itself configure Vercel credentials or migrate a separate production backend.