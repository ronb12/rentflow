import { NextResponse } from "next/server";
import { initSchema, query } from "@/lib/db";

export async function GET() {
  try {
    await initSchema();
    const rows = await query("SELECT subscription_status FROM companies WHERE id = 'default' LIMIT 1");
    const status = Array.isArray(rows) && rows[0]?.subscription_status ? rows[0].subscription_status : 'unknown';
    return NextResponse.json({ subscription_status: status });
  } catch {
    return NextResponse.json({ subscription_status: 'unknown' });
  }
}


