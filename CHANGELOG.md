## Changelog

All notable changes to this project will be documented in this file.
The format is based on Keep a Changelog and this project adheres to Semantic Versioning.

### [Unreleased]
- TBD

### [1.0.0] - 2025-10-31
#### Added
- Accounting-lite: rent ledger, late fee rules, owner statements (PDF)
- Documents: template library, versioning, professional previews, digital signatures
- Messaging: threaded conversations, read state, quick filters
- Maintenance & Work Orders: requests, assignments, statuses, costs
- Vendors: directory, assignments, response & resolution targets (SLA rules)
- Payments: Stripe Connect onboarding, tenant payments to connected accounts
- Subscriptions: $30/mo plan with 7-day trial; gating and webhooks
- Payment Schedules: tenant list + manager creation; weekly split plan; change requests
- Tours: tenant schedule requests and manager review
- Seeding endpoint `/api/seed` for deterministic demo data

#### Changed
- Dashboard navigation and list/table UIs for clarity and consistency
- “Dunning” renamed to “Late Payment Reminders” throughout

#### Fixed
- Template versions route conflict; build/type errors across API routes
- Document preview rendering and signature duplication
- Vendor rate persistence and returned units

### Notes
- GitHub and Vercel pipelines are separate; deploys are CLI-only by design


