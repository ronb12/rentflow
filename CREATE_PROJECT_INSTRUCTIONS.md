# Create Firebase Project for RentFlow

## Current Status
❌ CLI blocked - You're at the 17-project limit (Spark plan allows 5-10)

## Solution: Create via Firebase Console

### Step 1: Open Firebase Console
https://console.firebase.google.com

### Step 2: Create New Project
1. Click **"Add project"** or **"Create a project"**
2. Enter project name: **RentFlow-App** (or any name you prefer)
3. Enter project ID: **rentflow-app-2024** (or any unique ID)
4. Click **Continue**

### Step 3: Configure Google Analytics (Optional)
- Toggle off Google Analytics if you don't need it
- Click **Continue**

### Step 4: Wait for Creation
- Project creation takes ~30 seconds
- Click **Continue**

### Step 5: Return Here
After creation, run:
```bash
cd /Users/ronellbradley/Desktop/RentFlow
firebase use rentflow-app-2024
firebase init firestore hosting functions
```

### Important: If "Add project" is Disabled

If you still see quota errors in the console, you need to:

#### Option A: Upgrade to Blaze (2 minutes)
1. Go to https://console.firebase.google.com
2. Click **"Upgrade"** on any existing project
3. Enable billing (won't be charged)
4. Then create the new project

#### Option B: Delete More Projects
1. Go to https://console.firebase.google.com
2. Delete unused projects
3. Wait a few minutes for processing
4. Try creating the new project again

### What Happens After Creation

Once you run `firebase use <project-id>`, I'll:
1. Link your local project to Firebase
2. Enable required services (Auth, Firestore, Storage, Functions)
3. Deploy Firestore rules and indexes
4. Set up hosting configuration

