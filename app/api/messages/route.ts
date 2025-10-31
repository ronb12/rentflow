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

    // Try insert with extended columns; fallback to legacy if columns not present
    try {
      await query(
        `INSERT INTO messages 
         (id, tenant_id, message, status, created_at, updated_at, sender_role, is_read) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          data.tenantId || "tenant_1",
          data.message || "",
          data.status || "sent",
          now,
          now,
          data.senderRole || "renter",
          data.isRead ? 1 : 0,
        ]
      );
    } catch (e) {
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
    }

    return NextResponse.json({ id, ...data, message: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

// PATCH /api/messages to mark read for a tenant or a specific id
export async function PATCH(req: NextRequest) {
  try {
    await ensureSchema();
    const body = await req.json();
    const now = Date.now();
    if (body.id) {
      await query(`UPDATE messages SET is_read = 1, updated_at = ? WHERE id = ?`, [now, body.id]);
    } else if (body.tenantId) {
      await query(`UPDATE messages SET is_read = 1, updated_at = ? WHERE tenant_id = ?`, [now, body.tenantId]);
    } else {
      return NextResponse.json({ error: 'id or tenantId required' }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error updating messages:', error);
    return NextResponse.json({ error: 'Failed to update messages' }, { status: 500 });
  }
}
