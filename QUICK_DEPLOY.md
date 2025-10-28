# Quick Deploy Guide - You're Already at Turso!

Since you already have a Turso account at https://app.turso.tech/ronb12, let's get RentFlow live in the next few steps:

## Step 1: Create Database in Turso (2 minutes)

1. Go to https://app.turso.tech/ronb12
2. Click **"Create database"**
3. Name it: **rentflow-db**
4. Select region: **Choose closest to you**
5. Click **"Create"**

## Step 2: Get Connection Details (30 seconds)

After creating the database:

1. Click on **"rentflow-db"** in your Turso dashboard
2. Click **"Connect"** tab
3. Copy these two values:

   - **Database URL**: `libsql://rentflow-db-xxxxx.turso.io`
   - **Auth Token**: `your-long-token-string`

## Step 3: Add to Environment (1 minute)

Create `.env.local` file:

```bash
cd /Users/ronellbradley/Desktop/RentFlow

# Create the file
cat > .env.local << 'EOF'
TURSO_DATABASE_URL=libsql://rentflow-db-xxxxx.turso.io
TURSO_AUTH_TOKEN=your-token-here
NEXTAUTH_SECRET=generate-a-random-string-here
NODE_ENV=development
EOF
```

Or manually edit `.env.local` with the values from Turso.

## Step 4: Initialize Database (1 minute)

```bash
npm run dev
```

Then visit: http://localhost:3000/api/properties

This will auto-create all the database tables!

## Step 5: Create Test Users (1 minute)

Open another terminal and run:

```bash
# Create owner user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@example.com",
    "password": "Owner!234",
    "displayName": "Owner",
    "role": "owner",
    "organizationId": "org_1"
  }'

# Create manager user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@example.com",
    "password": "Manager!234",
    "displayName": "Manager",
    "role": "manager",
    "organizationId": "org_1"
  }'
```

## Step 6: Deploy to Vercel (2 minutes)

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables when prompted, or add them in Vercel dashboard
# Then deploy to production:
vercel --prod
```

**Your site will be live at:** `https://rentflow.vercel.app` (or similar URL)

## Step 7: Add Environment Variables to Vercel

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Click on your RentFlow project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `NEXTAUTH_SECRET`
5. Click **Redeploy**

## Done! 🎉

Your app will be live at: **https://rentflow-xxxxx.vercel.app**

Login credentials:
- Owner: `owner@example.com` / `Owner!234`
- Manager: `manager@example.com` / `Manager!234`

---

**Total time:** ~5-7 minutes from start to live!

Questions? Check:
- `COMPLETE_SETUP.md` - Detailed guide
- `TURSO_SETUP.md` - Database setup
- `MANUAL_DEPLOY.md` - Deployment details

