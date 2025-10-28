import { NextRequest, NextResponse } from "next/server";
import { query, initSchema } from "@/lib/db";

// Initialize schema on first request
let schemaInitialized = false;
async function ensureSchema() {
  if (!schemaInitialized) {
    await initSchema();
    schemaInitialized = true;
  }
}

// GET /api/invoices
export async function GET() {
  try {
    await ensureSchema();
    const rows = await query("SELECT * FROM invoices ORDER BY due_date DESC");
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

// POST /api/invoices
export async function POST(req: NextRequest) {
  try {
    await ensureSchema();
    const data = await req.json();
    const id = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    await query(
      `INSERT INTO invoices 
       (id, lease_id, invoice_number, due_date, amount, amount_paid, late_fees, status, organization_id, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.leaseId || "",
        data.invoiceNumber || `INV-${Date.now()}`,
        new Date(data.dueDate || now).getTime(),
        data.amount || 0,
        data.amountPaid || 0,
        data.lateFees || 0,
        data.status || "pending",
        data.organizationId || "org_1",
        now,
        now,
      ]
    );

    return NextResponse.json({ id, ...data });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}

