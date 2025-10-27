# RentFlow - Property & Trailer Park Management

A production-ready property and trailer-park management application with PWA support, offline inspection capabilities, and automated rent management.

## Features

### Core Functionality
- ✅ Property & Unit Management (apartments, houses, trailer parks)
- ✅ Tenant & Lease Management
- ✅ Invoice Generation & Payment Processing (Stripe)
- ✅ Work Order Management
- ✅ Reports (Rent Roll, Delinquency, Occupancy)
- ✅ Role-Based Access Control (Owner, Manager, Maintenance)

### PWA Capabilities
- ✅ Installable Web App (Add to Home Screen)
- ✅ Service Worker with App Shell Caching
- ✅ Offline Detection & Sync Status
- ✅ Mobile-First Responsive UI
- ✅ Large Touch Targets for Mobile

### Offline Inspection Mode
- ✅ Create inspections without internet connection
- ✅ Save drafts to IndexedDB with photos
- ✅ Background Sync when connection restored
- ✅ Status indicators (Queued/Synced)
- ✅ Conflict handling

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage, Functions)
- **Payments**: Stripe
- **PWA**: Service Worker, IndexedDB, Background Sync
- **CI/CD**: GitHub Actions

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Firebase project ([Create one](https://console.firebase.google.com))
- Stripe account ([Get started](https://stripe.com))

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-username/rentflow.git
cd rentflow
```

2. **Install dependencies**

```bash
npm install
cd functions && npm install && cd ..
```

3. **Configure environment variables**

Copy `env.example` to `.env.local` and fill in your credentials:

```bash
cp env.example .env.local
```

Update the following:
- `NEXT_PUBLIC_FIREBASE_*` - Your Firebase config
- `STRIPE_*` - Your Stripe keys (test mode)
- `APP_BASE_URL` - Your app URL (e.g., `http://localhost:3000`)

### Development

1. **Start Firebase emulators** (optional, for local development)

```bash
npm run emulate
```

2. **Start the Next.js dev server**

```bash
npm run dev
```

3. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

### Test Accounts

- **Owner**: `owner@example.com` / `Owner!234`
- **Manager**: `manager@example.com` / `Manager!234`

## PWA Installation

### Desktop (Chrome/Edge)

1. Open the app in your browser
2. Click the install icon in the address bar
3. Click "Install" when prompted

### Mobile (iOS)

1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"

### Mobile (Android)

1. Open the app in Chrome
2. Tap the menu (three dots)
3. Select "Add to Home Screen"

## Offline Inspection Testing

### Prerequisites
- App installed as PWA on mobile device or using Chrome DevTools Network Throttling

### Steps

1. **Go offline** in Chrome DevTools (Network tab → Offline)
2. **Navigate** to Inspections → New Inspection
3. **Create an inspection** with photos and notes
4. **Save** - Notice "Queued for Sync" status
5. **Go online** - Inspections auto-sync in background
6. **Check status** - Changes to "Synced"

### Troubleshooting

- If sync doesn't work, tap "Sync Now" button
- Check browser console for errors
- Ensure service worker is registered (Application → Service Workers)

## Deployment

### Manual Deployment

```bash
# Build the app
npm run build

# Deploy to Firebase
firebase deploy --only hosting,functions,firestore:rules,firestore:indexes
```

### Automated Deployment

Automatically deploys on push to `main` branch via GitHub Actions. Configure secrets in repository settings:

- `FIREBASE_TOKEN` - Firebase CLI token
- `NEXT_PUBLIC_FIREBASE_*` - Firebase config
- `STRIPE_*` - Stripe credentials

### Environment Setup

1. Go to repository Settings → Secrets and variables → Actions
2. Add all required secrets from `env.example`
3. Push to `main` branch to trigger deployment

## Project Structure

```
rentflow/
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # Dashboard and feature pages
│   ├── login/              # Authentication
│   └── layout.tsx          # Root layout with PWA provider
├── components/             # React components
│   ├── ui/                # shadcn/ui components
│   └── layout/            # Layout components
├── lib/                   # Utilities and configuration
│   ├── firebase.ts        # Firebase setup
│   ├── idb.ts             # IndexedDB helpers
│   └── inspection-sync.ts # Offline sync logic
├── functions/             # Firebase Cloud Functions
│   └── src/index.ts       # Function code
├── public/               # Static assets
│   ├── sw.js             # Service worker
│   └── manifest.json     # PWA manifest
├── scripts/              # Seed and utility scripts
└── types/                # TypeScript type definitions
```

## Features in Detail

### Offline Inspection System

The offline inspection feature uses:
- **IndexedDB** for draft storage
- **Service Worker** for background sync
- **Background Sync API** for deferred uploads
- **IndexedDB** for photo blob storage

### Payment Processing

- Stripe integration for subscriptions
- Tenant payment links
- Automated late fee calculation (Cloud Function)
- Invoice generation

### Reports

- **Rent Roll**: All properties, units, and rent amounts
- **Delinquency**: Tenants with overdue invoices
- **Occupancy**: Property occupancy rates

## Firebase Security Rules

Firestore security rules enforce:
- Organization-based access
- Role-based permissions
- User data isolation

## Stripe Webhooks

Configure webhooks at [Stripe Dashboard](https://dashboard.stripe.com/webhooks):
- Endpoint: `https://your-project.cloudfunctions.net/stripeWebhooks`
- Events: `invoice.payment_succeeded`, `customer.subscription.created`

## Troubleshooting

### Service Worker Issues
- Clear site data and refresh
- Check browser console for registration errors
- Verify service worker is running (Application → Service Workers)

### Firebase Emulator Issues
- Ensure Firestore, Auth, and Storage emulators are running
- Check emulator logs for errors
- Verify Firestore rules are deployed

### Build Errors
- Clear `.next` directory and rebuild
- Check TypeScript errors: `npm run typecheck`
- Verify environment variables are set

## License

Copyright © 2024 Bradley Virtual Solutions, LLC. All rights reserved.

## Support

For issues and questions, please open an issue on GitHub.

