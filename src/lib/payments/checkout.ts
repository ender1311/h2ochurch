"use server";

import { redirect } from "next/navigation";
import { getStripe } from "./stripe";
import { siteUrl } from "@/lib/site";
import { createAdminClient } from "@/utils/supabase/admin";
import { enforceRateLimit } from "@/lib/cms/rate-limit";

const MAX_GIFT_DOLLARS = 100000;

function str(fd: FormData, key: string): string {
  return ((fd.get(key) as string | null)?.trim() ?? "").slice(0, 200);
}

/** Public: start a Stripe Checkout session for an online gift. */
export async function startGivingCheckout(fd: FormData) {
  await enforceRateLimit("give", 12, 3600);
  const stripe = getStripe();
  if (!stripe) throw new Error("Online giving is not configured yet");

  const amount = Number(str(fd, "amount"));
  if (!Number.isFinite(amount) || amount < 1) throw new Error("Enter a valid amount");
  if (amount > MAX_GIFT_DOLLARS) throw new Error("Amount exceeds the online limit");

  // Validate the fund against real funds so metadata can't carry an arbitrary
  // label into donation records.
  let fund = str(fd, "fund") || "General";
  if (fund !== "General") {
    const supabase = createAdminClient();
    const { data: known } = await supabase.from("funds").select("name").eq("name", fund).maybeSingle();
    if (!known) fund = "General";
  }
  const email = str(fd, "email");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email || undefined,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(amount * 100),
          product_data: { name: `Gift — ${fund}` },
        },
      },
    ],
    metadata: { kind: "donation", fund },
    success_url: `${siteUrl()}/give?thanks=1`,
    cancel_url: `${siteUrl()}/give`,
  });

  redirect(session.url!);
}

/** Start a Stripe Checkout session to pay for an event registration. */
export async function startRegistrationCheckout(input: {
  registrationId: string;
  eventName: string;
  slug: string;
  costCents: number;
  email?: string | null;
}) {
  const stripe = getStripe();
  if (!stripe) return null;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: input.email ?? undefined,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: input.costCents,
          product_data: { name: `Registration — ${input.eventName}` },
        },
      },
    ],
    metadata: { kind: "registration", registration_id: input.registrationId },
    success_url: `${siteUrl()}/events/${input.slug}?registered=paid`,
    cancel_url: `${siteUrl()}/events/${input.slug}?registered=1`,
  });

  return session.url;
}
