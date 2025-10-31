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

// GET /api/invoices/[id] - Get single invoice
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureSchema();
    const rows = await query("SELECT * FROM invoices WHERE id = ?", [params.id]);
    
    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}

// PUT /api/invoices/[id] - Update invoice
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureSchema();
    const data = await request.json();
    const now = Date.now();

    await query(
      `UPDATE invoices SET 
       lease_id = ?, invoice_number = ?, due_date = ?, amount = ?, 
       amount_paid = ?, late_fees = ?, status = ?, updated_at = ?
       WHERE id = ?`,
      [
        data.leaseId || "",
        data.invoiceNumber || "",
        new Date(data.dueDate || now).getTime(),
        data.amount || 0,
        data.amountPaid || 0,
        data.lateFees || 0,
        data.status || "pending",
        now,
        params.id,
      ]
    );

    return NextResponse.json({ message: "Invoice updated successfully" });
  } catch (error) {
    console.error("Error updating invoice:", error);
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}

// DELETE /api/invoices/[id] - Delete invoice
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureSchema();
    
    await query("DELETE FROM invoices WHERE id = ?", [params.id]);

    return NextResponse.json({ message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 }
    );
  }
}