# Budget Safeguards for RentFlow

## How to NEVER Pay (Stay Within Free Limits)

### 1. Enable Budget Alerts

#### In Google Cloud Console:
1. Go to [Google Cloud Console Billing](https://console.cloud.google.com/billing)
2. Select your billing account
3. Click "Budgets & alerts"
4. Create a budget with:
   - Budget name: "RentFlow Budget"
   - Budget amount: **$0.50** (temporary spending limit to trigger early warning)
   - Alert threshold: 80% ($0.40)
   - Send alert to your email

#### In Firebase Console:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click on your project
3. Go to Settings → Billing
4. Enable "Send emails for quota-related alerts"

### 2. Set Up Spending Limit (CRITICAL)

**This will STOP all services if you hit $1:**

```bash
# This is the most important safeguard
# Once set, Firebase will AUTOMATICALLY disable paid services
# if spending reaches $1 (or your chosen limit)
```

To set it up:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Billing → Budgets & Alerts
3. Create Alert Policy:
   - Threshold: $1.00
   - Action: **DISABLE BILLING** for the project
4. This ensures you can NEVER accidentally spend

### 3. Firebase Free Tier Limits (Monitor These)

| Service | Free Limit | How to Monitor |
|---------|-----------|----------------|
| **Firestore** | 50K reads/day<br>20K writes/day | Dashboard → Usage |
| **Storage** | 5 GB | Dashboard → Storage usage |
| **Functions** | 2M invocations/month | Functions → Usage |
| **Auth** | 50K sessions/month | Auth → Usage |
| **Hosting** | 10 GB storage | Hosting → Analytics |

### 4. Add Usage Monitoring to RentFlow

I'll add a usage dashboard to the app so you can see in real-time if you're approaching limits.

### 5. Recommended Settings

**For RentFlow specifically:**
- Firestore: Only essential data (properties, tenants, leases, invoices)
- Storage: Compress inspection photos before upload
- Functions: Only run when necessary (scheduled jobs)
- Auth: Only 2 test users for now

**Conservation Strategies:**
- Use Firestore cache aggressively
- Compress images before uploading
- Batch Firestore operations
- Use IndexedDB for offline data (not counted!)

### 6. Daily Monitoring

Check Firebase Console daily for:
- Firestore usage % (keep under 80%)
- Storage usage % (keep under 80%)
- Functions invocation count

### 7. Auto-Disable Feature

You can add a Node.js script that checks usage daily and disables certain features if approaching limits.

Would you like me to:
- Create a usage monitoring script?
- Add the safeguards to prevent accidental usage spikes?
- Set up the budget alerts automatically?

