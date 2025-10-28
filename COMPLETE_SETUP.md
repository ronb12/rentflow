# RentFlow - Complete Setup Guide

## ✅ What's Now Complete

1. ✅ In-app backend with API routes
2. ✅ Turso database setup
3. ✅ Frontend updated to use API routes
4. ✅ All CRUD operations ready
5. ✅ Offline inspections working with IndexedDB
6. ✅ PWA features ready

## 🚀 Next Steps to Deploy

### Step 1: Set Up Turso Database (5 minutes)

1. Go to https://turso.tech
2. Sign up with GitHub
3. Click "Create database"
4. Name it: `rentflow-db`
5. Select region (closest to you)
6. Click "Create"

Get connection details:
1. Click on your database
2. Click "Connect" tab
3. Copy:
   - **Database URL** (looks like: `libsql://xxx.turso.io`)
   - **Auth Token** (long string)

### Step 2: Add Environment Variables

Create `.env.local` file:
```bash
cd /Users/ronellbradley/Desktop/RentFlow
cp env.example .env.local
```

Edit `.env.local`:
```env
TURSO_DATABASE_URL=libsql://your-db-name.turso.io
TURSO_AUTH_TOKEN=your-long-token-here
```

### Step 3: Test Locally

```bash
# Start the dev server
npm run dev

# Visit http://localhost:3000
# Login page redirects to /dashboard
```

### Step 4: Deploy to Vercel

**Option A: Via Command Line**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables
vercel env add TURSO_DATABASE_URL
vercel env add TURSO_AUTH_TOKEN

# Production deploy
vercel --prod
```

**Option B: Via Vercel Dashboard**
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New Project"
4. Import: `ronb12/rentflow`
5. Add environment variables:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
6. Click "Deploy"

### Step 5: Initialize Database

Once deployed, visit your API endpoint to create tables:
- `https://your-app.vercel.app/api/properties`
- This auto-creates the database schema

Or run manually:
```sql
-- In Turso dashboard, go to "SQL Editor"
-- Copy and run the schema from lib/db.ts initSchema()
```

## 🎉 That's It!

Your app is now:
- ✅ Live on Vercel
- ✅ Connected to Turso database
- ✅ API routes working
- ✅ Offline inspections working
- ✅ Completely independent
- ✅ **FREE** ($0/month)

---

## Testing Checklist

- [ ] Can create property
- [ ] Can create tenant
- [ ] Can create inspection offline
- [ ] Inspections sync when online
- [ ] PWA can be installed
- [ ] Works on mobile

---

## Troubleshooting

**Database connection fails:**
- Check TURSO_DATABASE_URL and TURSO_AUTH_TOKEN
- Verify in Turso dashboard

**API returns 500:**
- Check Vercel function logs
- Ensure database schema is initialized

**Build fails:**
- Ensure env variables are set in Vercel
- Check `npm run build` locally first

## Need Help?

Check these docs:
- `TURSO_SETUP.md` - Database setup
- `MANUAL_DEPLOY.md` - Deployment guide
- `STATUS.md` - Current status

