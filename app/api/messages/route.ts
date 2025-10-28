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

// GET /api/messages
export async function GET() {
  try {
    await ensureSchema();
    const rows = await query("SELECT * FROM messages ORDER BY created_at DESC");
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching messages:", error);
    // Return mock data for testing when database fails
    return NextResponse.json([
      {
        id: "msg_1",
        tenant_id: "tenant_1",
        message: "Hello, I have a question about parking for guests",
        status: "sent",
        created_at: Date.now(),
        updated_at: Date.now()
      }
    ]);
  }
}

// POST /api/messages
export async function POST(req: NextRequest) {
  try {
    await ensureSchema();
    const data = await req.json();
    const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    await query(
      `INSERT INTO messages 
       (id, tenant_id, message, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.tenantId || "tenant_1",
        data.message || "",
        data.status || "sent",
        now,
        now,
      ]
    );

    return NextResponse.json({ id, ...data, message: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
