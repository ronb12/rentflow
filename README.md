## RentFlow

Property management web app by Bradley Virtual Solutions, LLC.

### Overview
RentFlow streamlines day-to-day property management for managers and tenants.

- Accounting-lite: rent ledger, late fee rules, owner statements (PDF)
- Documents: template library, previews, digital signatures (manager & tenant)
- Messaging: threaded conversations, read states, notifications
- Maintenance & Work Orders: requests, assignments, costs, status tracking
- Vendors: directory, assignments, response & resolution targets
- Payments: Stripe Connect onboarding, company-scoped payments, subscription gating
- Schedules: tenant payment schedules, change requests, weekly split options
- Tours: schedule property tours with manager review

### Tech Stack
- Next.js 14 (App Router), TypeScript, React
- Tailwind CSS
- Database: Turso (libSQL)
- Stripe: Checkout, Connect, Webhooks (REST API)
- Email: SendGrid (optional)

### Getting Started (Local)
1) Requirements
   - Node 18+
   - npm 9+

2) Environment variables: create `.env.local` in the project root with any that apply:
```
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=

# Stripe (required for payments/subscriptions in dev)
STRIPE_SECRET_KEY=
STRIPE_PRICE_ID=               # $30/mo with 7-day trial
STRIPE_WEBHOOK_SECRET=         # if testing webhooks locally

# Optional
SENDGRID_API_KEY=
```

3) Install and run:
```
npm ci
npm run dev
```

4) Seed sample data (recommended):
```
POST http://localhost:3000/api/seed
```

### Key Scripts
- `npm run dev` – start local dev server
- `npm run build` – production build
- `npm run start` – start production build locally

### Manual Deploys (Recommended)
RentFlow uses separate pipelines: GitHub for code, Vercel for deployments.

Deploy to Vercel (Production):
```
npx vercel --prod --yes
```

Point alias to latest production deployment:
```
npx vercel alias <deployment-url> rentflow-property.vercel.app
```

Note: If you see GitHub PR/commit checks for Vercel failing, disconnect the Vercel GitHub App from this repository (Project → Settings → Git in Vercel, and GitHub → Settings → Installed Apps) to keep deploys CLI-only.

### Important Routes
- API
  - `/api/seed` – populate sample data
  - `/api/work-orders` – create/list/update work orders
  - `/api/maintenance-requests` – create/list/update requests
  - `/api/vendors` and `/api/vendors/assignments` – vendor management
  - `/api/templates` – template CRUD and versions
  - `/api/documents` and `/api/documents/sign` – document store & signing
  - `/api/messages` – threaded messaging
  - `/api/payment-schedules` – schedules and weekly plan
  - `/api/payment-schedules/change-requests` – schedule change requests
  - `/api/accounting/*` – ledger, late fees, owner statements
  - `/api/billing/*` – Stripe Connect, subscribe, pay, webhook, status

### Environment Notes
- Never commit secrets. `.env.local` is ignored.
- Vercel: set env vars in Project → Settings → Environment Variables.

### Troubleshooting
- Build fails with “Invalid or unexpected token”: ensure files are UTF-8 without BOM.
- Local DB errors (Turso): verify `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` or use in-memory fallback if supported by `lib/db.ts`.
- Stripe checkout issues: verify `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, and that the Price ID has no trailing whitespace.

### Branding & Attribution
- Product of Bradley Virtual Solutions, LLC
- Company branding settings are available in the dashboard; template previews render company details dynamically.

### License
All rights reserved. Unauthorized copying or distribution is prohibited.


