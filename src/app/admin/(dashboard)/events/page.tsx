import Link from "next/link";
import { createAdminClient } from "@/utils/supabase/admin";
import type { EventRow } from "@/lib/cms/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Events — H2O Hub" };

function fmtDate(v: string | null) {
  if (!v) return "No date set";
  return new Date(v).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function EventsPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("events")
    .select("*, event_registrations(count)")
    .order("starts_at", { ascending: true, nullsFirst: false });

  const events = (data ?? []) as (EventRow & { event_registrations: { count: number }[] })[];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-extrabold text-ink">Events</h1>
          <p className="mt-1 text-ink/60">Retreats, gatherings, and anything people register for.</p>
        </div>
        <Link
          href="/admin/events/new"
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold uppercase tracking-widest text-cream transition-colors hover:bg-water"
        >
          + New event
        </Link>
      </div>

      <div className="mt-8 grid gap-4">
        {events.map((e) => (
          <Link
            key={e.id}
            href={`/admin/events/${e.id}`}
            className="group flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-ink/10 bg-cream p-6 transition-all duration-300 hover:border-water/30"
          >
            <div>
              <h2 className="font-display text-xl font-bold text-ink group-hover:text-brand">{e.name}</h2>
              <p className="mt-1 text-sm text-ink/55">
                {fmtDate(e.starts_at)}
                {e.location ? ` · ${e.location}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="font-display text-2xl font-extrabold text-brand">
                  {e.event_registrations?.[0]?.count ?? 0}
                </p>
                <p className="text-xs uppercase tracking-widest text-ink/40">registered</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                  e.registration_open ? "bg-water/10 text-brand" : "bg-ink/5 text-ink/40"
                }`}
              >
                {e.registration_open ? "Open" : "Closed"}
              </span>
            </div>
          </Link>
        ))}
        {events.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-ink/20 p-16 text-center text-ink/50">
            No events yet. Create your first one.
          </div>
        ) : null}
      </div>
    </div>
  );
}
