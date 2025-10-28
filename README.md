# RentFlow - Property Management PWA

A production-ready property & trailer-park management application with **complete independence** - in-app backend, offline support, and PWA capabilities.

## ✨ Features

### Core Functionality
- ✅ Property & Unit Management (apartments, houses, trailer parks)
- ✅ Tenant & Lease Management  
- ✅ Invoice Generation & Payment Processing
- ✅ Work Order Management
- ✅ Reports (Rent Roll, Delinquency, Occupancy)
- ✅ Role-Based Access Control

### PWA Capabilities
- ✅ Installable Web App (Add to Home Screen)
- ✅ Offline-First Architecture
- ✅ Service Worker with App Shell Caching
- ✅ Offline Inspections with Background Sync
- ✅ Mobile-First Responsive UI

### Complete Independence
- ✅ **In-app backend** - All API routes in your codebase
- ✅ **Turso database** - SQLite in the cloud (FREE)
- ✅ **No external dependencies** - Each project is independent
- ✅ **No quotas** - Generous free tier (500 databases, 9B rows/month)

## 🏗️ Architecture

```
Frontend (Next.js)
    ↓
API Routes (Backend in App)
    ↓
Turso Database (SQLite)
```

**All logic in one codebase** - No vendor lock-in!

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Turso account (free at https://turso.tech)

### Installation

1. **Clone and install:**
```bash
git clone https://github.com/ronb12/rentflow.git
cd rentflow
npm install
```

2. **Set up Turso database:**
   - See `TURSO_SETUP.md` for detailed instructions
   - Create database at https://turso.tech
   - Get connection string and auth token

3. **Configure environment:**
```bash
cp env.example .env.local
# Edit .env.local with your Turso credentials
```

4. **Run locally:**
```bash
npm run dev
# Visit http://localhost:3000
```

5. **Deploy to Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```
Or see `MANUAL_DEPLOY.md` for complete deployment guide.

## 📁 Project Structure

```
app/
├── api/              # Backend API routes
│   ├── properties/
│   ├── tenants/
│   ├── leases/
│   ├── invoices/
│   └── inspections/
├── dashboard/        # Frontend pages
└── lib/
    ├── db.ts        # Turso database client
    ├── idb.ts       # IndexedDB helpers
    └── utils.ts     # Utilities
```

## 💰 Cost

**FREE Forever:**
- ✅ Turso: 500 databases, 9 billion rows/month
- ✅ Vercel: Unlimited requests, 100GB bandwidth
- ✅ Total: $0/month

## 📚 Documentation

- `COMPLETE_SETUP.md` - Complete deployment guide
- `TURSO_SETUP.md` - Database setup instructions
- `MANUAL_DEPLOY.md` - Deployment instructions
- `STATUS.md` - Current project status
- `HOSTING_LIMITATIONS.md` - Why we use Vercel not GitHub Pages
- `BACKEND_PERFORMANCE.md` - Performance comparison

## 🎯 Why This Approach?

### Independence ✅
- Each project has its own database
- No shared Firebase projects needed
- Complete data isolation

### Performance ✅  
- 3-5x faster than Firebase for simple queries
- Direct SQLite access
- No network latency for API calls

### Cost ✅
- Completely free
- No quotas or limits for typical usage
- Scales with your needs

### Development ✅
- All code in one codebase
- Easy to understand and modify
- No vendor lock-in

## 🔧 Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes (in-app)
- **Database:** Turso (SQLite)
- **Hosting:** Vercel
- **PWA:** Service Worker, IndexedDB

## 📄 License

Copyright © 2024 Bradley Virtual Solutions, LLC. All rights reserved.

## 🤝 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Ready to deploy?** See `COMPLETE_SETUP.md` for step-by-step instructions! 🚀
