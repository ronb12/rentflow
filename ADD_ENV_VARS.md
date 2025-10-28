# Add Environment Variables to Vercel

Since the CLI approach requires interactive input, here's the fastest way:

## Option 1: Vercel Dashboard (Recommended - 30 seconds)

1. Go to: https://vercel.com/ronell-bradleys-projects/rentflow/settings/environment-variables
2. Click **"Add New"**
3. Add these 3 variables:

**Variable 1:**
- Name: `TURSO_DATABASE_URL`
- Value: `libsql://rentflow-db-ronb12.aws-us-east-1.turso.io`
- Environment: Production, Preview, Development

**Variable 2:**
- Name: `TURSO_AUTH_TOKEN` 
- Value: `eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjE2MTQyODIsImlkIjoiNzJlZDg1OTMtNjZhYy00OWUxLWEzZDAtMGViN2NmOGQ0MjEyIiwicmlkIjoiMTk2Zjg1MmMtY2Q2Yi00YmNiLWFkNjYtYWVlM2IyYzliOGI0In0.lYF4oGIFPzHWdaafGAPG2GXFi4LWpa2259C722nMGXFa6hwDDxFhyLT1qW1akh5EoZCP-biQJuSMfUHRybl6DQ`
- Environment: Production, Preview, Development

**Variable 3:**
- Name: `NEXTAUTH_SECRET`
- Value: `rentflow-secret-key-2024`
- Environment: Production, Preview, Development

4. Click **"Save"**
5. Go to **"Deployments"** tab
6. Click **"Redeploy"** on the latest deployment

## Option 2: CLI (if you prefer)

```bash
cd /Users/ronellbradley/Desktop/RentFlow

# Add each variable (will prompt for value)
vercel env add TURSO_DATABASE_URL production main
# Enter: libsql://rentflow-db-ronb12.aws-us-east-1.turso.io

vercel env add TURSO_AUTH_TOKEN production main  
# Enter: eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjE2MTQyODIsImlkIjoiNzJlZDg1OTMtNjZhYy00OWUxLWEzZDAtMGViN2NmOGQ0MjEyIiwicmlkIjoiMTk2Zjg1MmMtY2Q2Yi00YmNiLWFkNjYtYWVlM2IyYzliOGI0In0.lYF4oGIFPzHWdaafGAPG2GXFi4LWpa2259C722nMGXFa6hwDDxFhyLT1qW1akh5EoZCP-biQJuSMfUHRybl6DQ

vercel env add NEXTAUTH_SECRET production main
# Enter: rentflow-secret-key-2024

# Then redeploy
vercel --prod
```

## After Adding Variables

Your site will be live at:
**https://rentflow-5zn68nsct-ronell-bradleys-projects.vercel.app**

Login with any email/password (simple auth for now).
