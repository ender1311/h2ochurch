import { notFound } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/admin";
import { registerForEvent } from "@/lib/cms/actions/events";
import { spotsLeft } from "@/lib/cms/registration";
import { PageHero } from "@/components/site/PageHero";
import type { EventRow } from "@/lib/cms/types";

export const dynamic = "force-dynamic";

function fmt(v: string | null) {
  if (!v) return null;
  return new Date(v).toLocaleString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function PublicEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ registered?: string }>;
}) {
  const { slug } = await params;
  const { registered } = await searchParams;
  const supabase = createAdminClient();
  const { data } = await supabase.from("events").select("*").eq("slug", slug).maybeSingle();
  if (!data || data.visibility !== "listed") notFound();
  const ev = data as EventRow;

  const { count: activeCount } = await supabase
    .from("event_registrations")
    .select("*", { count: "exact", head: true })
    .eq("event_id", ev.id)
    .neq("status", "cancelled");
  const remaining = spotsLeft(ev.capacity, activeCount ?? 0);
  const isFull = remaining === 0;

  const register = registerForEvent.bind(null, ev.id, slug);
  const when = fmt(ev.starts_at);

  return (
    <main>
      <PageHero
        eyebrow="Event"
        title={ev.name}
        subtitle={[when, ev.location].filter(Boolean).join(" · ") || undefined}
      />
      <section className="bg-paper py-20 sm:py-28">
        <div className="mx-auto grid max-w-5xl gap-12 px-5 sm:px-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            {ev.description ? (
              <p className="whitespace-pre-wrap text-lg leading-relaxed text-ink/75">{ev.description}</p>
            ) : (
              <p className="text-lg text-ink/60">We&apos;d love to have you join us.</p>
            )}
            <dl className="mt-8 space-y-3 text-sm">
              {when ? (
                <div className="flex gap-3">
                  <dt className="w-24 font-bold uppercase tracking-widest text-brand">When</dt>
                  <dd className="text-ink/80">{when}</dd>
                </div>
              ) : null}
              {ev.location ? (
                <div className="flex gap-3">
                  <dt className="w-24 font-bold uppercase tracking-widest text-brand">Where</dt>
                  <dd className="text-ink/80">{ev.location}</dd>
                </div>
              ) : null}
              <div className="flex gap-3">
                <dt className="w-24 font-bold uppercase tracking-widest text-brand">Cost</dt>
                <dd className="text-ink/80">{ev.cost_cents ? `$${(ev.cost_cents / 100).toFixed(2)}` : "Free"}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-3xl border border-ink/10 bg-cream p-8">
            {registered === "waitlist" ? (
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate text-white">
                  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 3" strokeLinecap="round" />
                  </svg>
                </div>
                <h2 className="mt-5 font-display text-2xl font-bold text-ink">You&apos;re on the waitlist</h2>
                <p className="mt-2 text-ink/60">
                  This event is currently full — we&apos;ll reach out if a spot opens up.
                </p>
              </div>
            ) : registered ? (
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand text-cream">
                  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 className="mt-5 font-display text-2xl font-bold text-ink">You&apos;re registered!</h2>
                <p className="mt-2 text-ink/60">We&apos;ll see you there. Check your email for details.</p>
              </div>
            ) : ev.registration_open ? (
              <form action={register} className="grid gap-4">
                <h2 className="font-display text-2xl font-bold text-ink">
                  {isFull ? "Join the waitlist" : "Register"}
                </h2>
                {remaining !== null && !isFull ? (
                  <p className="-mt-2 text-sm font-semibold text-brand">{remaining} spots left</p>
                ) : null}
                {isFull ? (
                  <p className="-mt-2 text-sm text-ink/60">
                    This event is full — sign up below and we&apos;ll contact you if a spot opens.
                  </p>
                ) : null}
                <div className="grid gap-4 sm:grid-cols-2">
                  <input name="first_name" required placeholder="First name" className="rounded-xl border border-ink/15 bg-paper px-4 py-3 outline-none focus:border-brand" />
                  <input name="last_name" required placeholder="Last name" className="rounded-xl border border-ink/15 bg-paper px-4 py-3 outline-none focus:border-brand" />
                </div>
                <input name="email" type="email" placeholder="Email" className="rounded-xl border border-ink/15 bg-paper px-4 py-3 outline-none focus:border-brand" />
                <input name="phone" placeholder="Phone" className="rounded-xl border border-ink/15 bg-paper px-4 py-3 outline-none focus:border-brand" />
                <textarea name="notes" rows={2} placeholder="Anything we should know?" className="rounded-xl border border-ink/15 bg-paper px-4 py-3 outline-none focus:border-brand" />
                <button className="rounded-full bg-brand py-3.5 text-sm font-bold uppercase tracking-widest text-cream transition-colors hover:bg-water">
                  {isFull ? "Join Waitlist" : "Register"}
                </button>
              </form>
            ) : (
              <p className="text-center text-ink/60">Registration for this event is closed.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
