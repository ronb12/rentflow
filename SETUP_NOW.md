# RentFlow Setup - Right Now!

You have: Turso account ✅  
You need: Create database + Deploy to Vercel

## 🔥 Quick Start (5 Minutes)

### 1. Create Database
Go to: https://app.turso.tech/ronb12

1. Click **"Create database"** button
2. Name: `rentflow-db`
3. Region: Choose closest to you
4. Click **"Create"**

### 2. Get Credentials
After creating:
- Click on `rentflow-db`
- Click **"Connect"** tab
- Copy the **Database URL** and **Auth Token**

### 3. Add to Project
```bash
cd /Users/ronellbradley/Desktop/RentFlow

# Create .env.local
cat > .env.local << 'EOF'
TURSO_DATABASE_URL=<paste-database-url>
TURSO_AUTH_TOKEN=<paste-auth-token>
NEXTAUTH_SECRET=my-super-secret-key-12345
EOF
```

### 4. Test Locally
```bash
npm run dev
# Visit http://localhost:3000
```

### 5. Deploy to Vercel
```bash
# First time
npm i -g vercel
vercel login
vercel

# Add environment variables in Vercel dashboard (or when prompted)
# Then deploy to production:
vercel --prod
```

**Your site will be:** `https://rentflow-xxxx.vercel.app`

---

See `QUICK_DEPLOY.md` for complete step-by-step instructions with test user creation.

