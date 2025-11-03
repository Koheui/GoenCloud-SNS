import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Stripe from "stripe";

admin.initializeApp();
const db = admin.firestore();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2022-11-15" });

export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers["stripe-signature"] as string;
  try {
    const event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      const kind = session.metadata.kind;

      if (kind === "token") {
        const uid = session.metadata.userId;
        const tokens = Number(session.metadata.tokens || 0);
        const eventId = event.id;
        const txRef = db.doc(`users/${uid}/tokenTransactions/${eventId}`);
        const userRef = db.doc(`users/${uid}`);

        await db.runTransaction(async (t) => {
          if ((await t.get(txRef)).exists) return;
          const bal = (await t.get(userRef)).data()?.tokenBalance || 0;
          t.set(txRef, {
            type: "purchase",
            tokens,
            source: "stripe",
            stripeEventId: eventId,
            status: "committed",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          t.update(userRef, { tokenBalance: bal + tokens, lastTokenUpdateAt: admin.firestore.FieldValue.serverTimestamp() });
        });
      }

      if (kind === "condolence") {
        const { spaceId, donorUid } = session.metadata;
        const amount = session.amount_total / 100;
        const fee = Math.round(amount * 0.15);
        const net = amount - fee;

        await db.doc(`condolences/${event.id}`).set({
          spaceId,
          donorUid: donorUid ?? null,
          amount,
          fee,
          net,
          status: "succeeded",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
      }
    }

    if (event.type === "charge.refunded") {
      const refund = event.data.object as any;
      await db.doc(`condolences/${refund.id}`).set({
        status: "refunded",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    }

    res.json({ received: true });
  } catch (err: any) {
    console.error(err);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

// Hello World
export const helloWorld = functions.https.onRequest((req, res) => {
  res.send("Hello from Goen Cloud Functions!");
});

