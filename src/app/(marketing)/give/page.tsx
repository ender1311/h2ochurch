import type { Metadata } from "next";
import { createAdminClient } from "@/utils/supabase/admin";
import { isStripeConfigured } from "@/lib/payments/stripe";
import { startGivingCheckout } from "@/lib/payments/checkout";
import { PageHero } from "@/components/site/PageHero";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Give — H2O Church",
  description: "Fuel the mission — give securely online to H2O Church, Columbus.",
};

const PRESETS = [25, 50, 100, 250];

export default async function GivePage({
  searchParams,
}: {
  searchParams: Promise<{ thanks?: string }>;
}) {
  const { thanks } = await searchParams;
  const supabase = createAdminClient();
  const { data: funds } = await supabase.from("funds").select("name").order("name");
  const stripeReady = isStripeConfigured();

  return (
    <main>
      <PageHero
        eyebrow="Generosity"
        title="Give"
        subtitle="Your generosity sends the gospel across campus and around the world. H2O Church is a registered 501(c)(3) — gifts are tax-deductible."
      />

      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-xl px-5 sm:px-8">
          {thanks ? (
            <div className="rounded-lg border border-brand/30 bg-foam px-8 py-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white">
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="mt-5 font-display text-2xl font-bold text-slate">Thank you!</h2>
              <p className="mt-2 text-ink/70">
                Your gift was received. A receipt is on its way to your email.
              </p>
            </div>
          ) : stripeReady ? (
            <form action={startGivingCheckout} className="border border-black/5 bg-white p-8 shadow-[0_10px_40px_-15px_rgba(43,51,60,0.18)]">
              <h2 className="font-display text-2xl font-bold text-slate">Give online</h2>
              <div className="mt-6 grid grid-cols-4 gap-2">
                {PRESETS.map((v) => (
                  <label key={v} className="cursor-pointer">
                    <input type="radio" name="preset" value={v} className="peer sr-only" />
                    <span className="block rounded border border-ink/15 py-3 text-center text-sm font-bold text-ink peer-checked:border-brand peer-checked:bg-brand peer-checked:text-white">
                      ${v}
                    </span>
                  </label>
                ))}
              </div>
              <label className="mt-4 block">
                <span className="text-xs font-bold uppercase tracking-widest text-ink/50">Amount (USD)</span>
                <input
                  name="amount"
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  placeholder="50.00"
                  className="mt-1.5 w-full rounded border border-ink/15 px-4 py-3 outline-none focus:border-brand"
                />
              </label>
              <label className="mt-4 block">
                <span className="text-xs font-bold uppercase tracking-widest text-ink/50">Fund</span>
                <select name="fund" className="mt-1.5 w-full rounded border border-ink/15 px-4 py-3 outline-none focus:border-brand">
                  <option value="General">General</option>
                  {(funds ?? []).map((f) => (
                    <option key={f.name} value={f.name}>{f.name}</option>
                  ))}
                </select>
              </label>
              <label className="mt-4 block">
                <span className="text-xs font-bold uppercase tracking-widest text-ink/50">Email (for your receipt)</span>
                <input name="email" type="email" placeholder="you@example.com" className="mt-1.5 w-full rounded border border-ink/15 px-4 py-3 outline-none focus:border-brand" />
              </label>
              <button className="mt-6 w-full bg-brand py-4 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-deep">
                Continue to secure payment
              </button>
              <p className="mt-3 text-center text-xs text-ink/40">
                Processed securely by Stripe. You&apos;ll be redirected to complete your gift.
              </p>
            </form>
          ) : (
            <div className="rounded-lg border border-dashed border-ink/20 px-8 py-12 text-center">
              <h2 className="font-display text-2xl font-bold text-slate">Online giving is almost ready</h2>
              <p className="mx-auto mt-3 max-w-sm text-ink/60">
                In the meantime, you can give in person on Sundays at 1385 Neil Ave, or reach us at{" "}
                <a href="mailto:pastors@h2osu.org" className="font-semibold text-brand">pastors@h2osu.org</a>.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
