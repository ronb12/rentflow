# RentFlow Setup Guide

## Prerequisites
- Node.js 20+ installed
- Firebase account ([sign up](https://firebase.google.com))
- GitHub account
- Stripe account (for payments)

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository named `rentflow`
3. Make it public or private (your choice)
4. **Don't** initialize with README
5. Copy the repository URL

6. Run these commands to link and push:

```bash
cd /Users/ronellbradley/Desktop/RentFlow

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/rentflow.git

# Push to GitHub
git push -u origin main
```

## Step 2: Firebase Project Setup

### Option A: Use an Existing Firebase Project (Recommended)

Since you've reached the Firebase project quota, you can reuse an existing project:

```bash
# Choose any project from your list, for example:
firebase use aba-mastery-app
```

**Note**: This will NOT affect your existing projects - Firebase projects can have multiple apps/sites.

### Option B: Delete Unused Projects

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click on unused projects
3. Go to Project Settings → General
4. Scroll down and click "Delete Project"

### Option C: Create New Project

If you delete projects or request quota increase:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Name it `rentflow`
4. Disable Google Analytics (optional)
5. Click "Create project"

### Enable Services

1. **Authentication**:
   - Go to Authentication → Get Started
   - Enable Email/Password provider

2. **Firestore Database**:
   - Go to Firestore Database → Create database
   - Start in **test mode** (we'll update rules later)
   - Choose a location

3. **Storage**:
   - Go to Storage → Get Started
   - Start in **test mode** (we'll update rules later)

4. **Hosting**:
   - Go to Hosting → Get Started
   - Follow the setup steps
   - **Don't deploy yet** - we'll do that after configuration

5. **Functions**:
   - Go to Functions → Get Started
   - Upgrade to Blaze plan if needed

### Get Firebase Config

1. Go to Project Settings (gear icon)
2. Scroll to "Your apps"
3. Click Web icon (`</>`) to add web app
4. Register app as "RentFlow"
5. Copy the config values

## Step 3: Configure Environment

1. Copy the example env file:
```bash
cp env.example .env.local
```

2. Edit `.env.local` and add your Firebase config:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
APP_BASE_URL=http://localhost:3000
```

## Step 4: Create Firebase Service Account

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Save the JSON file (we'll need this for seed script)

## Step 5: Deploy Firebase Rules & Indexes

```bash
# Login to Firebase
firebase login

# Initialize (if not already done)
firebase init

# Deploy rules and indexes
firebase deploy --only firestore:rules,firestore:indexes
```

## Step 6: Set Up GitHub Secrets

1. Go to your GitHub repo → Settings → Secrets and variables → Actions
2. Add these secrets:

- `FIREBASE_TOKEN` - Get from: `firebase login:ci`
- `NEXT_PUBLIC_FIREBASE_API_KEY` - From your Firebase config
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - From your Firebase config
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - From your Firebase config
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - From your Firebase config
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - From your Firebase config
- `NEXT_PUBLIC_FIREBASE_APP_ID` - From your Firebase config
- `STRIPE_SECRET_KEY` - From Stripe dashboard
- `STRIPE_WEBHOOK_SECRET` - From Stripe dashboard

To get Firebase token:
```bash
firebase login:ci
```

## Step 7: Local Development

1. Install dependencies:
```bash
npm install
cd functions && npm install && cd ..
```

2. Build the app:
```bash
npm run build
```

3. Start development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Step 8: Deploy to Firebase Hosting

### Manual Deployment

```bash
# Build the app
npm run build

# Deploy (first time, you may need to run: firebase login)
firebase deploy --only hosting
```

### Automated Deployment

Push to `main` branch:
```bash
git push origin main
```

GitHub Actions will automatically deploy!

## Step 9: Set Up Stripe Webhooks

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Endpoint URL: `https://your-project-id.cloudfunctions.net/stripeWebhooks`
4. Select events:
   - `invoice.payment_succeeded`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Save and copy the webhook secret

## Step 10: Create Test Users (Optional)

After deploying, you can create test users via Firebase Console:
1. Go to Authentication → Users
2. Click "Add user"
3. Create users with emails:
   - `owner@example.com` (password: `Owner!234`)
   - `manager@example.com` (password: `Manager!234`)

## Troubleshooting

### Firebase Login Issues
```bash
firebase logout
firebase login
```

### Build Errors
```bash
rm -rf .next node_modules
npm install
npm run build
```

### Service Worker Not Registering
- Check browser console for errors
- Verify `sw.js` is accessible at `/sw.js`
- Clear browser cache and reload

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Create Firebase project
3. ⏳ Deploy to Firebase Hosting
4. ⏳ Set up Stripe webhooks
5. ⏳ Create test users
6. ⏳ Test PWA installation
7. ⏳ Test offline inspections

## Need Help?

Open an issue on GitHub or check the [README.md](README.md) for more details.

