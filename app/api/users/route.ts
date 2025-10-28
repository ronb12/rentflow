import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// POST /api/users - Create test users
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    await query(
      `INSERT INTO users (id, email, password, display_name, role, organization_id, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.email,
        data.password, // Store plaintext for demo - hash in production
        data.displayName || "",
        data.role || "manager",
        data.organizationId || "org_1",
        now,
        now,
      ]
    );

    return NextResponse.json({ id, ...data, password: undefined });
  } catch (error: any) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create user" },
      { status: 500 }
    );
  }
}

// GET /api/users - Get users (for testing)
export async function GET() {
  try {
    const rows = await query("SELECT id, email, display_name, role FROM users");
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

