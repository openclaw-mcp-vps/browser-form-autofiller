import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { recordCompletedSession } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_unused", {
  apiVersion: "2025-08-27.basil"
});

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await recordCompletedSession({
      sessionId: session.id,
      email: session.customer_details?.email ?? "",
      amountTotal: session.amount_total ?? 0,
      currency: session.currency ?? "usd"
    });
  }

  return NextResponse.json({ received: true });
}
