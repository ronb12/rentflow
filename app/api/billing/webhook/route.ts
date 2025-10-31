import { NextRequest, NextResponse } from "next/server";
import { initSchema, query } from "@/lib/db";

export async function POST(req: NextRequest) {
  const sk = process.env.STRIPE_SECRET_KEY;
  if (!sk) return NextResponse.json({ error: 'Missing STRIPE_SECRET_KEY' }, { status: 500 });
  const Stripe = (await import('stripe')).default;
  const stripe = new Stripe(sk as string);

  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event: any;
  if (whSecret) {
    const sig = req.headers.get('stripe-signature') as string;
    const buf = Buffer.from(await req.arrayBuffer());
    try {
      event = stripe.webhooks.constructEvent(buf, sig, whSecret);
    } catch (err: any) {
      return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }
  } else {
    event = await req.json();
  }

  const t = event.type;
  const obj = event.data?.object || {};

  try {
    await initSchema();
    const now = Date.now();

    if (t === 'customer.subscription.created' || t === 'customer.subscription.updated') {
      const status = obj.status as string;
      await query(
        `INSERT INTO companies (id, name, created_at, updated_at) VALUES ('default', 'Default Company', ?, ?)
         ON CONFLICT(id) DO UPDATE SET updated_at = excluded.updated_at`,
        [now, now]
      );
      await query(`UPDATE companies SET updated_at = ?, name = name WHERE id = 'default'`, [now]);
      await query(`UPDATE company_settings SET updated_at = ? WHERE id = 'default'`, [now]);
      await query(`UPDATE companies SET updated_at = ?, name = name WHERE id = 'default'`, [now]);
      await query(`UPDATE companies SET updated_at = ? WHERE id = 'default'`, [now]);
      await query(`UPDATE companies SET updated_at = ?, name = name WHERE id = 'default'`, [now]);
      // Persist basic status on companies table as a simple approach
      await query(`ALTER TABLE companies ADD COLUMN subscription_status TEXT`, []).catch(() => {});
      await query(`UPDATE companies SET subscription_status = ? WHERE id = 'default'`, [status]);
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    return NextResponse.json({ error: 'Webhook handling failed' }, { status: 500 });
  }
}

export const runtime = 'nodejs';


