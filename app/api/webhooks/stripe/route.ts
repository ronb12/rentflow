import { NextRequest, NextResponse } from "next/server";
import { query, initSchema } from "@/lib/db";
import Stripe from 'stripe';

// Initialize Stripe (only if key is provided)
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
}) : null;

// Initialize schema on first request
let schemaInitialized = false;
async function ensureSchema() {
  if (!schemaInitialized) {
    await initSchema();
    schemaInitialized = true;
  }
}

// POST /api/webhooks/stripe
export async function POST(req: NextRequest) {
  try {
    await ensureSchema();
    
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!stripe || !signature || !process.env.STRIPE_WEBHOOK_SECRET) {
      console.warn("Stripe webhook signature or secret not configured");
      return NextResponse.json({ received: true });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    await query(
      `UPDATE payments 
       SET status = ?, updated_at = ? 
       WHERE stripe_payment_intent_id = ?`,
      ['completed', Date.now(), paymentIntent.id]
    );

    console.log(`Payment succeeded: ${paymentIntent.id}`);
    
    // Here you could add additional logic like:
    // - Send confirmation email
    // - Update lease status
    // - Generate receipt
    // - Update tenant balance
    
  } catch (error) {
    console.error('Error updating payment status:', error);
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    await query(
      `UPDATE payments 
       SET status = ?, updated_at = ? 
       WHERE stripe_payment_intent_id = ?`,
      ['failed', Date.now(), paymentIntent.id]
    );

    console.log(`Payment failed: ${paymentIntent.id}`);
    
    // Here you could add additional logic like:
    // - Send failure notification
    // - Retry payment
    // - Update tenant status
    
  } catch (error) {
    console.error('Error updating failed payment status:', error);
  }
}

async function handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent) {
  try {
    await query(
      `UPDATE payments 
       SET status = ?, updated_at = ? 
       WHERE stripe_payment_intent_id = ?`,
      ['canceled', Date.now(), paymentIntent.id]
    );

    console.log(`Payment canceled: ${paymentIntent.id}`);
    
  } catch (error) {
    console.error('Error updating canceled payment status:', error);
  }
}
