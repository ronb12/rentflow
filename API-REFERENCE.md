## API Reference

Base URL (local): `http://localhost:3000`

Auth/roles are simplified for demo; most endpoints assume an `organizationId` via params or default.

### Documents
- `GET /api/documents` – list documents
- `POST /api/documents` – create (manager)
- `DELETE /api/documents?id=<id>` – delete (manager)
- `POST /api/documents/sign` – sign document `{ id, signerName, signerRole }`

### Templates
- `GET /api/templates` – list latest templates per name
- `POST /api/templates` – create new template or new version
- `GET /api/templates/versions/<name>` – list versions for template name
- `GET /api/templates/<id>` – get template by ID
- `PATCH /api/templates/<id>` – update template by ID
- `POST /api/templates/preview` – render preview with merge fields `{ templateId, fields }`

### Messaging
- `GET /api/messages?tenantId=...` – list messages for thread
- `POST /api/messages` – create message `{ tenantId, senderRole, text }`
- `PATCH /api/messages` – mark read `{ tenantId }`

### Maintenance & Work Orders
- `GET /api/maintenance-requests` – list requests
- `POST /api/maintenance-requests` – create request (tenant)
- `PATCH /api/maintenance-requests` – update status `{ id, status }`
- `GET /api/work-orders` – list work orders
- `POST /api/work-orders` – create work order
- `PATCH /api/work-orders` – update work order fields

### Vendors
- `GET /api/vendors` – list vendors
- `POST /api/vendors` – create vendor
- `GET /api/vendors/<id>` – get vendor
- `PATCH /api/vendors/<id>` – update vendor
- `GET /api/vendors/assignments` – list assignments
- `POST /api/vendors/assignments` – create assignment
- `PATCH /api/vendors/assignments/<id>` – update assignment
- `GET /api/vendors/sla` – list response & resolution targets (SLA rules)
- `POST /api/vendors/sla` – create target rule

### Accounting
- `GET /api/accounting/rent-ledger` – list transactions
- `POST /api/accounting/rent-ledger` – add transaction
- `GET /api/accounting/late-fee-rules` – list rules
- `POST /api/accounting/late-fee-rules` – create rule
- `PUT /api/accounting/late-fee-rules/<id>` – update rule
- `POST /api/accounting/late-fees` – calculate late fees
- `GET /api/accounting/owner-statements` – list statements
- `POST /api/accounting/owner-statements` – generate statement
- `GET /api/accounting/owner-statements/<id>/pdf` – download PDF

### Payments & Schedules
- `POST /api/payments/prorate` – calculate prorated amount
- `GET /api/payment-schedules` – list payment schedules
- `POST /api/payment-schedules` – create schedule (manager)
- `POST /api/payment-schedules/weekly-plan` – create 4 weekly schedules
- `GET /api/payment-schedules/change-requests` – list pending change requests (manager)
- `POST /api/payment-schedules/change-requests` – create request (tenant)
- `PATCH /api/payment-schedules/change-requests` – approve/deny (manager)
- `PATCH /api/payment-schedules/change-requests/<id>` – approve/deny specific

### Tours
- `GET /api/tours` – list tour requests
- `POST /api/tours` – create tour request (tenant)

### Billing (Stripe)
- `POST /api/billing/connect` – Connect onboarding link (manager/company)
- `POST /api/billing/subscribe` – $30/mo plan with 7‑day trial
- `POST /api/billing/pay` – tenant payment Checkout (to connected account)
- `POST /api/billing/webhook` – Stripe webhooks
- `GET /api/billing/status` – subscription status
- `GET /api/billing/diag` – diagnostics (dev)

### Seeding
- `POST /api/seed` – seed sample data for demo/testing


