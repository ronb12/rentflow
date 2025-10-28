# Migration Plan: In-App Backend for Independence

## Why You Need This

✅ Each project stays **completely independent**  
✅ No shared Firebase projects  
✅ Own database for each app  
✅ Fully self-contained backend  
✅ No external dependencies  

## The Solution

**Stack:**
- **Next.js with API Routes** (backend in app)
- **Turso** (SQLite database - FREE)
- **Vercel** (hosting - FREE)
- **NextAuth.js** (authentication - FREE)

**Total Cost:** $0/month ✅

---

## Why Can't Use GitHub Pages?

**GitHub Pages = Static only**  
- ❌ Can't run API routes
- ❌ No server-side code
- ❌ No database connections

**Need Vercel (or similar):**
- ✅ Runs Next.js API routes
- ✅ Serverless functions
- ✅ Database connections
- ✅ Still FREE

---

## Migration Steps

### Phase 1: Setup Backend (Day 1)

1. **Install dependencies:**
```bash
cd /Users/ronellbradley/Desktop/RentFlow
npm install @libsql/client next-auth@beta
```

2. **Create API routes structure:**
```
app/
├── api/
│   ├── properties/
│   │   ├── route.ts          # GET, POST
│   │   └── [id]/
│   │       └── route.ts       # GET, PUT, DELETE
│   ├── tenants/
│   │   └── route.ts
│   ├── leases/
│   │   └── route.ts
│   ├── invoices/
│   │   └── route.ts
│   └── inspections/
│       └── route.ts
```

3. **Setup Turso database:**
   - Sign up at https://turso.tech
   - Create new database
   - Get connection string
   - Add to `.env.local`

### Phase 2: Rewrite Backend (Week 1)

**Replace Firebase calls with API routes:**

```typescript
// BEFORE (Firebase):
import { collection, addDoc, getDocs } from "firebase/firestore";

// AFTER (API Routes):
async function getProperties() {
  const res = await fetch('/api/properties')
  return await res.json()
}
```

**Create API routes:**
- Database operations
- CRUD endpoints
- Authentication

### Phase 3: Update Frontend (Week 2)

**Replace Firebase SDK calls:**

```typescript
// Change all database calls to API routes
// Update all components to use fetch()
```

### Phase 4: Testing & Deployment

**Test locally:**
```bash
npm run dev
```

**Deploy to Vercel:**
```bash
npm install -g vercel
vercel
```

---

## Architecture Comparison

### Before (Firebase):
```
Frontend (Next.js)
    ↓
Firebase SDK
    ↓
Firebase Cloud
```

### After (In-App Backend):
```
Frontend (Next.js)
    ↓
API Routes (in app)
    ↓
Turso Database (external but per-project)
```

**Key:** Each app has its own API routes and database!

---

## File Structure

```
app/
├── api/
│   ├── properties/
│   ├── tenants/
│   ├── leases/
│   ├── invoices/
│   └── inspections/
├── dashboard/
│   └── [all pages]
└── lib/
    ├── db.ts          # Turso connection
    ├── auth.ts        # NextAuth config
    └── types.ts       # Database types
```

---

## Database Schema (Turso/SQLite)

```sql
-- Properties
CREATE TABLE properties (
  id TEXT PRIMARY KEY,
  name TEXT,
  address TEXT,
  type TEXT,
  organization_id TEXT,
  created_at INTEGER
);

-- Tenants
CREATE TABLE tenants (
  id TEXT PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  organization_id TEXT,
  created_at INTEGER
);

-- Leases
CREATE TABLE leases (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,
  property_id TEXT,
  start_date INTEGER,
  end_date INTEGER,
  monthly_rent INTEGER,
  status TEXT,
  created_at INTEGER
);

-- Invoices
CREATE TABLE invoices (
  id TEXT PRIMARY KEY,
  lease_id TEXT,
  due_date INTEGER,
  amount INTEGER,
  status TEXT,
  created_at INTEGER
);

-- Inspections
CREATE TABLE inspections (
  id TEXT PRIMARY KEY,
  property_id TEXT,
  inspection_type TEXT,
  date INTEGER,
  notes TEXT,
  status TEXT,
  photos TEXT,
  created_at INTEGER
);
```

---

## Cost Breakdown

| Component | Cost | Provider |
|-----------|------|----------|
| **Next.js Hosting** | FREE | Vercel |
| **API Routes** | FREE | Vercel |
| **Database** | FREE | Turso (500 databases, 9B rows/month) |
| **Auth** | FREE | NextAuth.js |
| **Storage** | FREE | Vercel (or cloud storage) |
| **Total** | **$0/month** | ✅ |

---

## Advantages

✅ **Complete independence** - Each app has its own database  
✅ **No external dependencies** - Everything in your code  
✅ **Free** - All services have generous free tiers  
✅ **Same tech stack** - Next.js throughout  
✅ **No quota issues** - Per-app resources  
✅ **Easy to deploy** - One command: `vercel`  

---

## Timeline

**Week 1:** Setup and database migration  
**Week 2:** API routes implementation  
**Week 3:** Frontend updates  
**Week 4:** Testing and deployment  

**Total:** 3-4 weeks part-time

---

## Getting Started

Would you like me to:

1. ✅ Start the migration to in-app backend?
2. ✅ Set up Turso database?
3. ✅ Create API routes structure?
4. ✅ Update frontend to use API routes?

**Let me know and I'll begin!**

