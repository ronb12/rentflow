## Environment Variables

Create `.env.local` in the project root. Do not commit this file.

### Database (Turso)
- `TURSO_DATABASE_URL` – libSQL/Turso database URL
- `TURSO_AUTH_TOKEN` – libSQL/Turso auth token

Notes:
- In local/dev, some APIs can fall back to in-memory if these are absent, but DB-backed features will require valid credentials.

### Stripe (Payments & Subscriptions)
- `STRIPE_SECRET_KEY` – Secret key (server-side). Required for billing endpoints
- `STRIPE_PRICE_ID` – Price for $30/mo plan with 7‑day trial
- `STRIPE_WEBHOOK_SECRET` – Webhook signing secret for `/api/billing/webhook`

Optional (client):
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` – Only if using Stripe Elements on client (not required for Checkout-only flows)

### Email (Optional)
- `SENDGRID_API_KEY` – If sending emails via SendGrid

### App/Runtime
- `NEXT_PUBLIC_APP_URL` – Base URL used by some redirects (fallbacks to request origin)

### Vercel
Set these in Vercel Project → Settings → Environment Variables for Production/Preview. Redeploy after updates.

### Tips
- Ensure `STRIPE_PRICE_ID` has no trailing spaces/newlines
- For local webhooks: use `stripe listen --forward-to localhost:3000/api/billing/webhook`
- Never share secrets in issues or PRs


