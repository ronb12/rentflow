# Manual Deployment Guide

## Quick Deploy Commands

### For Local Development:
```bash
npm run dev
# Opens http://localhost:3000
```

### For Testing Build:
```bash
npm run build
npm start
```

---

## Deploy to Vercel (Recommended)

### Option 1: Vercel CLI (Automatic)
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Production deploy
vercel --prod
```

**That's it!** Vercel will:
- ✅ Auto-detect Next.js
- ✅ Run npm install
- ✅ Build your app
- ✅ Deploy it
- ✅ Give you a URL

### Option 2: Vercel Dashboard (Web UI)

1. Go to https://vercel.com
2. Sign up/login with GitHub
3. Click "Add New Project"
4. Import your GitHub repo: `ronb12/rentflow`
5. Add environment variables:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
6. Click "Deploy"

**Done!** Your app will be live at: `https://rentflow.vercel.app`

---

## Environment Variables

Add these to Vercel dashboard or `.env.local`:

```env
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token
```

---

## Manual Deploy Commands

```bash
# 1. Make sure you have Turso setup
# See TURSO_SETUP.md

# 2. Build locally to test
npm run build

# 3. Deploy to Vercel
vercel --prod

# Or deploy specific version
vercel --prod --force
```

---

## GitHub Actions Removed

✅ No automatic deployments on push
✅ You deploy manually when ready
✅ Full control over releases

To deploy: Just run `vercel --prod` when you're ready!

