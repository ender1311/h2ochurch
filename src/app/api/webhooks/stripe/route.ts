import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/payments/stripe";
import { createAdminClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    const payload = await request.text();
    event = await stripe.webhooks.constructEventAsync(payload, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const kind = session.metadata?.kind;
    const supabase = createAdminClient();

    if (kind === "donation") {
      // Unique index on stripe_session_id makes retries idempotent.
      const email = session.customer_details?.email?.toLowerCase() ?? null;
      let personId: string | null = null;
      let fundId: string | null = null;

      if (email) {
        const { data } = await supabase.from("people").select("id").eq("email", email).maybeSingle();
        personId = data?.id ?? null;
      }
      const fundName = session.metadata?.fund;
      if (fundName && fundName !== "General") {
        const { data } = await supabase.from("funds").upsert({ name: fundName }, { onConflict: "name" }).select("id").single();
        fundId = data?.id ?? null;
      }

      await supabase.from("donations").insert({
        person_id: personId,
        fund_id: fundId,
        amount_cents: session.amount_total ?? 0,
        method: "online",
        note: email ? `Stripe checkout (${email})` : "Stripe checkout",
        stripe_session_id: session.id,
      });
    }

    if (kind === "registration" && session.metadata?.registration_id) {
      await supabase
        .from("event_registrations")
        .update({ paid_at: new Date().toISOString(), stripe_session_id: session.id })
        .eq("id", session.metadata.registration_id);
    }
  }

  return NextResponse.json({ received: true });
}
