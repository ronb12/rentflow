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

// GET /api/payments
export async function GET() {
  try {
    await ensureSchema();
    const rows = await query("SELECT * FROM payments ORDER BY created_at DESC");
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

// POST /api/payments
export async function POST(req: NextRequest) {
  try {
    await ensureSchema();
    const data = await req.json();
    const id = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    await query(
      `INSERT INTO payments 
       (id, tenant_id, amount, payment_method, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.tenantId || "tenant_1",
        data.amount || 0,
        data.paymentMethod || "",
        data.status || "pending",
        now,
        now,
      ]
    );

    return NextResponse.json({ id, ...data });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}


