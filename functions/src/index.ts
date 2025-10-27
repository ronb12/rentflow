import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

// Stripe webhooks
export const stripeWebhooks = functions.https.onRequest(async (req, res) => {
  // Implement Stripe webhook handling
  // This is a placeholder - implement full Stripe integration
  res.status(200).send({ received: true });
});

// Calculate late fees
export const calculateLateFees = functions.pubsub.schedule("0 1 * * *").onRun(async (context) => {
  const now = new Date();
  const db = admin.firestore();

  // Find all active leases with due invoices
  const invoices = await db.collection("invoices")
    .where("status", "==", "overdue")
    .get();

  const batch = db.batch();

  for (const doc of invoices.docs) {
    const invoice = doc.data();
    const lease = await db.collection("leases").doc(invoice.leaseId).get();
    const leaseData = lease.data();

    if (leaseData && leaseData.lateFeeAmount) {
      // Calculate days overdue
      const dueDate = invoice.dueDate.toDate();
      const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysOverdue > 0) {
        const lateFee = daysOverdue * (leaseData.lateFeeAmount || 0);
        batch.update(doc.ref, {
          lateFees: admin.firestore.FieldValue.increment(lateFee),
          amount: invoice.amount + lateFee,
        });
      }
    }
  }

  await batch.commit();
  console.log(`Processed ${invoices.size} invoices for late fees`);
});

// Sync offline inspections
export const syncInspections = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
  }

  const { inspections } = data;
  const db = admin.firestore();
  const batch = db.batch();

  for (const inspection of inspections) {
    const docRef = db.collection("inspections").doc();
    batch.set(docRef, {
      ...inspection,
      syncedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();
  return { success: true, count: inspections.length };
});

