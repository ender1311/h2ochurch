import "server-only";
import Stripe from "stripe";

/** Null when STRIPE_SECRET_KEY isn't configured — callers degrade gracefully. */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
