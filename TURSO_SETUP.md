# Turso Database Setup Guide

## What is Turso?

Turso is a **SQLite database in the cloud** - perfect for your in-app backend!

**Free Tier:**
- ✅ 500 databases
- ✅ 9 billion rows/month
- ✅ Edge replication (global CDN)
- ✅ Built on SQLite (fast, reliable)

**Cost:** $0/month

---

## Step 1: Create Turso Account

1. Go to https://turso.tech
2. Click "Sign Up" or "Get Started"
3. Sign in with GitHub
4. You're in!

---

## Step 2: Create Database

1. In Turso dashboard, click **"Create database"**
2. Name it: **rentflow-db** (or any name)
3. Select region (choose closest to you)
4. Click **"Create database"**

---

## Step 3: Get Connection String

1. Click on your database
2. Go to "Connect" tab
3. Copy these two values:

```bash
# Database URL
TURSO_DATABASE_URL=libsql://your-db-name-your-org.turso.io

# Auth Token
TURSO_AUTH_TOKEN=your-long-token-here
```

---

## Step 4: Add to Environment

1. Copy `env.example` to `.env.local`:
```bash
cp env.example .env.local
```

2. Edit `.env.local` and add your Turso credentials:
```env
TURSO_DATABASE_URL=libsql://your-db-name-your-org.turso.io
TURSO_AUTH_TOKEN=your-token-here
```

3. Save the file

---

## Step 5: Initialize Database Schema

The schema will auto-create on first API call, or you can initialize it manually:

```bash
npm run dev
```

Visit: http://localhost:3000/api/init (we'll create this route if needed)

---

## Step 6: Test Connection

Try creating a property:

```bash
# Start the dev server
npm run dev

# Visit http://localhost:3000/api/properties
# Should return an empty array []
```

---

## Done! 🎉

Your database is now connected and ready to use!

---

## Next Steps

1. ✅ Database created and connected
2. Next: Test API routes
3. Next: Update frontend to use API routes
4. Next: Deploy to Vercel

---

## Tips

- **Backups:** Turso auto-backs up your data
- **Scaling:** Automatically scales with traffic
- **Speed:** SQLite is faster than most databases
- **Free tier is generous:** 500 databases, 9 billion rows!

---

## Troubleshooting

**Error: "Unauthorized"**
- Check your TURSO_AUTH_TOKEN is correct
- Regenerate token in Turso dashboard

**Error: "Database not found"**
- Check your TURSO_DATABASE_URL is correct
- Make sure database exists in dashboard

**Connection issues:**
- Check environment variables are set
- Restart dev server after changing .env

