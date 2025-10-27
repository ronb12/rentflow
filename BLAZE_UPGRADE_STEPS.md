# Upgrade to Blaze Plan - Step by Step

## Quick Steps (2 minutes)

### Step 1: Upgrade via Console
1. I've opened the Firebase Console for you
2. OR go to: https://console.firebase.google.com/project/_/usage/details
3. Look for "Upgrade" or "Modify plan" button
4. Click it and select **Blaze Plan**

### Step 2: Add Billing
1. Click **Enable billing**
2. Add your payment method (credit card)
3. **Important**: You won't be charged unless you exceed free limits
4. Set up budget alerts (recommended)

### Step 3: Budget Safeguards (Optional but Recommended)
After enabling billing:
1. Go to [Google Cloud Console](https://console.cloud.google.com/billing)
2. Click "Budgets & alerts"
3. Create budget:
   - Amount: **$1.00**
   - Alert at: **$0.80** ($0.80)
   - Action: **Disable billing** when limit reached

This ensures you NEVER pay anything!

### Step 4: Verify Upgrade
Run this command to check:
```bash
firebase projects:list
```

You should now be able to create more projects!

### Step 5: Create RentFlow Project
Once upgraded, run:
```bash
cd /Users/ronellbradley/Desktop/RentFlow
firebase projects:create rentflow-app-2024 --display-name "RentFlow Management"
```

Or just tell me "create project now" and I'll do it for you!

## Important Notes

✅ **You pay $0** until you exceed free tier limits:
- Firestore: 50K reads/day, 20K writes/day (free)
- Storage: 5 GB (free)
- Functions: 2M invocations/month (free)
- Auth: 50K sessions/month (free)

✅ **Automatic safeguards** are in place (see BUDGET_SAFEGUARDS.md)

✅ **Up to 100 projects** on Blaze (vs 5-10 on Spark)

## What You Get

- ✅ Can create 100 Firebase projects
- ✅ Access to Cloud Functions (needed for RentFlow)
- ✅ Better hosting performance
- ✅ Stripe webhooks support
- ✅ No extra cost (unless you exceed free limits)

