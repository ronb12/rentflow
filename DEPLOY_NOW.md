# Deploy RentFlow to Vercel - Right Now!

## ✅ What's Ready

- ✅ Turso database created: `rentflow-db`
- ✅ Environment variables set up in `.env.local`
- ✅ Code ready to deploy

## 🚀 Deploy in 3 Simple Steps

### Step 1: Deploy to Vercel
```bash
cd /Users/ronellbradley/Desktop/RentFlow
vercel --prod
```

When prompted:
- Link to existing project? **No**
- Set up? **Yes**
- Project name: **rentflow**
- Directory: **./**
- Override settings? **No**
- Install dependencies? **Yes**

### Step 2: Add Environment Variables

After first deployment, go to:
- https://vercel.com/ronell-bradleys-projects/rentflow/settings/environment-variables

Add these variables:
```
TURSO_DATABASE_URL = libsql://rentflow-db-ronb12.aws-us-east-1.turso.io
TURSO_AUTH_TOKEN = [your-token-from-above]
NEXTAUTH_SECRET = rentflow-secret-key-2024
```

### Step 3: Redeploy

```bash
vercel --prod
```

## 🎉 Your Site Will Be Live At:

**https://rentflow.vercel.app**

Or whatever URL Vercel gives you!

---

## Create Test Users After Deploy:

Once live, create users via API:

```bash
# Create owner
curl -X POST https://rentflow.vercel.app/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@example.com","password":"Owner!234","displayName":"Owner","role":"owner","organizationId":"org_1"}'

# Create manager  
curl -X POST https://rentflow.vercel.app/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@example.com","password":"Manager!234","displayName":"Manager","role":"manager","organizationId":"org_1"}'
```

Then login at: **https://rentflow.vercel.app/login**

