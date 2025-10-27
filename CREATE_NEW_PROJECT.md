# How to Create a New Firebase Project for RentFlow

## Problem
You're at the 17-project limit on the free Spark plan (which only allows 5-10 projects).

## Solutions

### Option 1: Upgrade to Blaze (Recommended - Takes 2 minutes)
The Blaze plan allows **100 projects** and is still free until you exceed the free tier limits.

**Steps:**
1. Go to https://console.firebase.google.com
2. Click "Upgrade" (top banner) on any project
3. Add billing method (won't be charged unless you exceed free limits)
4. Return here and run: `firebase projects:create rentflow-app`

**Cost:** $0 (free tier limits still apply)

### Option 2: Wait 30 Days
Deleted projects remain in your quota for 30 days.

### Option 3: Create via Firebase Console (Manual)
1. Go to https://console.firebase.google.com
2. Click "Add project"
3. Name it `rentflow-app`
4. Complete setup wizard
5. Then come back and run: `firebase use rentflow-app`

### Option 4: Delete More Projects
Check https://console.firebase.google.com for projects to delete.

## My Recommendation

**Upgrade to Blaze now** (Option 1). It takes 2 minutes and gives you:
- ✅ 100 projects (plenty of room)
- ✅ All the same free limits
- ✅ $0 cost (unless you exceed free tier)
- ✅ Access to Cloud Functions (needed for RentFlow)

After upgrading, just run:
```bash
firebase projects:create rentflow-app
```

Then I'll finish the setup! 🚀

