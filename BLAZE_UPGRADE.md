# Upgrading to Firebase Blaze Plan

## Why Upgrade?

Since you've hit the 18-project limit on the free Spark plan (which only allows 5-10 projects), upgrading to Blaze will:

1. ✅ Allow up to 100 Firebase projects
2. ✅ Continue using free tier limits at no cost
3. ✅ Access advanced features (Cloud Functions, better hosting)
4. ✅ Enable Stripe webhooks and Cloud Functions for RentFlow

## How to Upgrade

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select any project (or create a new one)
3. Click "Upgrade" in the top banner
4. Enable billing (add a payment method)
5. That's it! All your existing projects continue with free tier limits

## What Changes?

**Nothing!** Your existing projects continue with the same free limits:
- 50,000 Firestore reads/day
- 20,000 Firestore writes/day
- 5 GB Storage
- 2M Functions invocations/month
- 50K Firebase Auth sessions/month

You only pay when you exceed these limits.

## For RentFlow Specifically

RentFlow will use:
- **Firestore**: Property, tenant, lease data (probably under free tier)
- **Storage**: Inspection photos (5 GB free should cover a lot)
- **Auth**: User authentication (50K free sessions)
- **Functions**: Late fee scheduler, sync handler (2M invocations free)
- **Hosting**: Deploy the PWA

**Estimated monthly cost for RentFlow**: $0-$10 (most likely $0)

## Budget Alerts

Set up budget alerts to avoid surprises:
1. Go to [Google Cloud Console](https://console.cloud.google.com/billing)
2. Create budget alerts
3. Get notified if you exceed your expected costs

## Ready to Upgrade?

Click here: [Upgrade to Blaze](https://console.firebase.google.com)

Then you can create your new RentFlow project or use an existing one!

