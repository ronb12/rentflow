import { NextRequest, NextResponse } from "next/server";
import { query, initSchema } from "@/lib/db";
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

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
    // Return mock data for testing when database fails
    return NextResponse.json([
      {
        id: "pay_1",
        tenant_id: "tenant_1",
        amount: 1200,
        payment_method: "credit_card",
        status: "completed",
        stripe_payment_intent_id: "pi_mock_123",
        created_at: Date.now(),
        updated_at: Date.now()
      }
    ]);
  }
}

// POST /api/payments - Create Payment Intent
export async function POST(req: NextRequest) {
  try {
    await ensureSchema();
    const data = await req.json();
    
    // Validate required fields
    if (!data.amount || data.amount <= 0) {
      return NextResponse.json(
        { error: "Invalid payment amount" },
        { status: 400 }
      );
    }

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn("Stripe not configured, using mock payment");
      return handleMockPayment(data);
    }

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(data.amount), // Amount in cents
      currency: 'usd',
      metadata: {
        tenant_id: data.tenantId || 'tenant_1',
        payment_method: data.paymentMethod || 'credit_card',
        property_id: data.propertyId || 'property_1',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Store payment record in database
    const id = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    await query(
      `INSERT INTO payments 
       (id, tenant_id, amount, payment_method, status, stripe_payment_intent_id, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.tenantId || "tenant_1",
        data.amount,
        data.paymentMethod || "credit_card",
        "pending",
        paymentIntent.id,
        now,
        now,
      ]
    );

    return NextResponse.json({
      id,
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      message: "Payment intent created successfully"
    });

  } catch (error) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}

// PUT /api/payments - Confirm Payment
export async function PUT(req: NextRequest) {
  try {
    await ensureSchema();
    const data = await req.json();
    
    if (!data.payment_intent_id) {
      return NextResponse.json(
        { error: "Payment intent ID is required" },
        { status: 400 }
      );
    }

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return handleMockPaymentConfirmation(data);
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(data.payment_intent_id);

    // Update payment status in database
    await query(
      `UPDATE payments 
       SET status = ?, updated_at = ? 
       WHERE stripe_payment_intent_id = ?`,
      [paymentIntent.status, Date.now(), data.payment_intent_id]
    );

    return NextResponse.json({
      payment_intent_id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      message: `Payment ${paymentIntent.status}`
    });

  } catch (error) {
    console.error("Error confirming payment:", error);
    return NextResponse.json(
      { error: "Failed to confirm payment" },
      { status: 500 }
    );
  }
}

// Mock payment handler for when Stripe is not configured
async function handleMockPayment(data: any) {
  const id = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = Date.now();

  await query(
    `INSERT INTO payments 
     (id, tenant_id, amount, payment_method, status, stripe_payment_intent_id, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.tenantId || "tenant_1",
      data.amount,
      data.paymentMethod || "credit_card",
      "completed", // Mock as completed
      `pi_mock_${id}`,
      now,
      now,
    ]
  );

  return NextResponse.json({
    id,
    client_secret: `pi_mock_${id}_secret`,
    payment_intent_id: `pi_mock_${id}`,
    status: "succeeded",
    amount: data.amount,
    currency: "usd",
    message: "Mock payment completed (Stripe not configured)"
  });
}

async function handleMockPaymentConfirmation(data: any) {
  await query(
    `UPDATE payments 
     SET status = ?, updated_at = ? 
     WHERE stripe_payment_intent_id = ?`,
    ["succeeded", Date.now(), data.payment_intent_id]
  );

  return NextResponse.json({
    payment_intent_id: data.payment_intent_id,
    status: "succeeded",
    message: "Mock payment confirmed (Stripe not configured)"
  });
}