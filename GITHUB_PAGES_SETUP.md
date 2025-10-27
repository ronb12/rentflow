# GitHub Pages Hosting Setup

## What This Gives You

✅ **100% FREE** - No Firebase hosting costs  
✅ **No quota limits** - GitHub Pages is unlimited  
✅ **Auto-deploy** - Push to GitHub, automatically deploys  
✅ **Custom domain** - Add your own domain  
✅ **HTTPS** - Automatic SSL  
✅ **CDN** - Fast global delivery  

## How It Works

1. **Frontend on GitHub Pages** (the Next.js app)
2. **Backend on Firebase** (Auth, Firestore, Storage - uses an existing project)
3. **Auto-deploy** via GitHub Actions

## Setup Steps

### Step 1: Enable GitHub Pages

1. Go to your repo: https://github.com/ronb12/rentflow/settings/pages
2. Under "Source", select: **GitHub Actions**
3. Click **Save**

### Step 2: Add Firebase Config (Use Existing Project)

You'll still need a Firebase project for the backend. Use an existing one:

1. Go to https://console.firebase.google.com
2. Pick any project (e.g., `amplifi-a54d9`)
3. Get the config:
   - Project Settings → Your apps → Web app
   - Copy the config values

### Step 3: Add GitHub Secrets

Go to: https://github.com/ronb12/rentflow/settings/secrets/actions

Add these secrets (from your Firebase project):
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### Step 4: Push to Deploy

```bash
git add .
git commit -m "Setup GitHub Pages"
git push
```

GitHub Actions will automatically:
1. Build your Next.js app
2. Export static files
3. Deploy to GitHub Pages

### Step 5: Access Your App

Your app will be live at:
```
https://ronb12.github.io/rentflow/
```

## What You Get

**Hosting:** GitHub Pages (FREE)  
**Backend:** Firebase (use existing project - FREE)  
**Auto-deploy:** Push to main branch  
**Custom domain:** Add via repo settings

## Advantages vs Firebase Hosting

| Feature | GitHub Pages | Firebase Hosting |
|---------|-------------|------------------|
| **Cost** | ✅ FREE (unlimited) | ✅ FREE (limited) |
| **Quota** | ✅ No limits | ⚠️ 10 GB |
| **CDN** | ✅ Yes | ✅ Yes |
| **HTTPS** | ✅ Auto | ✅ Auto |
| **Custom Domain** | ✅ Free | ✅ Free |
| **Auto-deploy** | ✅ Yes (Actions) | ❌ Removed |
| **Firebase Integration** | ✅ Works | ✅ Native |

## Important Notes

### PWA on GitHub Pages

✅ Service worker works  
✅ Offline mode works  
✅ Manifest works  
✅ "Add to Home Screen" works  

### Limitations

❌ No server-side rendering (SSG/SSR only)  
✅ But our app uses `output: "export"` - perfect for static!  
❌ No API routes  
✅ But we use Firebase Functions for backend  

### Routing

GitHub Pages needs a special config for SPA routing. Already set up in `next.config.js`:

```js
output: "export"  // Static export
```

This creates all routes as static files - perfect for GitHub Pages!

## Enable GitHub Pages Now

1. Go to: https://github.com/ronb12/rentflow/settings/pages
2. Source: **GitHub Actions**
3. Click **Save**
4. Then push any commit:
   ```bash
   git add .github/workflows/pages.yml
   git commit -m "Add GitHub Pages deployment"
   git push
   ```

## After Deployment

1. Wait for GitHub Actions to finish (2-3 minutes)
2. Check: https://github.com/ronb12/rentflow/actions
3. View your app: https://ronb12.github.io/rentflow/

## Custom Domain (Optional)

1. Add a DNS record:
   - Type: `CNAME`
   - Name: `www` (or `@`)
   - Value: `ronb12.github.io`
2. In GitHub repo settings → Pages → Custom domain
3. Enter your domain

## Summary

**Hosting:** GitHub Pages (completely free, no quota)  
**Backend:** Firebase (use existing project - also free)  
**Total Cost:** $0  
**Auto-deploy:** Yes  
**Custom domain:** Yes  

This is a great solution if you want to avoid Firebase hosting quotas!

