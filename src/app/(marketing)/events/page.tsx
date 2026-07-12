import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/utils/supabase/admin";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/Reveal";
import type { EventRow } from "@/lib/cms/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Events — H2O Church",
  description: "Upcoming events, retreats, and gatherings at H2O Church, Ohio State.",
};

function fmt(v: string | null) {
  if (!v) return "Date TBA";
  return new Date(v).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function PublicEventsPage() {
  // Public content only: listed events, public columns.
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("events")
    .select("id,name,slug,description,starts_at,ends_at,location,cost_cents,registration_open,visibility")
    .eq("visibility", "listed")
    .order("starts_at", { ascending: true, nullsFirst: false });

  const events = ((data ?? []) as EventRow[]).filter(
    (e) => !e.ends_at || new Date(e.ends_at ?? e.starts_at ?? "").getTime() >= Date.now() - 864e5,
  );

  return (
    <main>
      <PageHero
        eyebrow="H2O Church"
        title="Events"
        subtitle="Retreats, gatherings, and everything happening in our community. We'd love to see you there."
      />

      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          {events.length === 0 ? (
            <div className="rounded-lg border border-dashed border-ink/20 p-16 text-center text-ink/50">
              No upcoming events right now — check back soon!
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((e, i) => (
                <Reveal
                  key={e.id}
                  as="article"
                  delay={(i % 3) * 100}
                  className="flex flex-col border border-black/5 bg-white shadow-[0_10px_40px_-15px_rgba(43,51,60,0.18)] transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="border-b-4 border-brand bg-sand px-7 py-5">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">{fmt(e.starts_at)}</p>
                    <h2 className="mt-1 font-display text-2xl font-bold text-slate">{e.name}</h2>
                  </div>
                  <div className="flex flex-1 flex-col p-7">
                    {e.location ? (
                      <p className="flex items-center gap-2 text-sm text-ink/60">
                        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-brand" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z" />
                          <circle cx="12" cy="10" r="2.5" />
                        </svg>
                        {e.location}
                      </p>
                    ) : null}
                    {e.description ? (
                      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-ink/70">{e.description}</p>
                    ) : (
                      <span className="flex-1" />
                    )}
                    <div className="mt-6 flex items-center justify-between">
                      <span className="text-sm font-bold text-slate">
                        {e.cost_cents ? `$${(e.cost_cents / 100).toFixed(2)}` : "Free"}
                      </span>
                      {e.slug ? (
                        <Link
                          href={`/events/${e.slug}`}
                          className={`px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition-colors ${
                            e.registration_open ? "bg-brand hover:bg-deep" : "bg-ink/30"
                          }`}
                        >
                          {e.registration_open ? "Register" : "Details"}
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
