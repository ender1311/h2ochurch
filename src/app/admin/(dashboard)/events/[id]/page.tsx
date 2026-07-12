import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/admin";
import { deleteEvent, setRegistrationStatus } from "@/lib/cms/actions/events";
import { DeleteButton } from "@/components/admin/DeleteButton";
import type { EventRow, EventRegistration } from "@/lib/cms/types";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: event } = await supabase.from("events").select("*").eq("id", id).single();
  if (!event) notFound();
  const ev = event as EventRow;

  const { data: regs } = await supabase
    .from("event_registrations")
    .select("*")
    .eq("event_id", id)
    .order("created_at", { ascending: true });
  const registrations = (regs ?? []) as EventRegistration[];

  const active = registrations.filter((r) => r.status !== "cancelled").length;
  const remove = deleteEvent.bind(null, id);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <Link href="/admin/events" className="text-sm font-semibold text-ink/50 hover:text-brand">
          ← Back to events
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/events/${id}/edit`}
            className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-bold uppercase tracking-widest text-ink transition-colors hover:border-brand hover:text-brand"
          >
            Edit
          </Link>
          <DeleteButton action={remove} confirm={`Delete ${ev.name} and all its registrations?`} />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-extrabold text-ink">{ev.name}</h1>
          <p className="mt-1 text-ink/60">
            {active} registered{ev.capacity ? ` / ${ev.capacity}` : ""}
            {ev.cost_cents ? ` · $${(ev.cost_cents / 100).toFixed(2)}` : " · Free"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {ev.slug ? (
            <a
              href={`/events/${ev.slug}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-bold uppercase tracking-widest text-ink transition-colors hover:border-brand hover:text-brand"
            >
              View public page ↗
            </a>
          ) : null}
          <a
            href={`/admin/events/${id}/export`}
            className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-bold uppercase tracking-widest text-ink transition-colors hover:border-brand hover:text-brand"
          >
            Export CSV
          </a>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-3xl border border-ink/10 bg-cream">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 bg-sand/50 text-xs font-bold uppercase tracking-widest text-ink/50">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="hidden px-6 py-4 sm:table-cell">Email</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/8">
            {registrations.map((r) => {
              const cancel = setRegistrationStatus.bind(null, id, r.id, "cancelled");
              const restore = setRegistrationStatus.bind(null, id, r.id, "registered");
              return (
                <tr key={r.id} className={r.status === "cancelled" ? "opacity-50" : ""}>
                  <td className="px-6 py-4 font-semibold text-ink">
                    {r.first_name} {r.last_name}
                  </td>
                  <td className="hidden px-6 py-4 text-ink/70 sm:table-cell">{r.email ?? "—"}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-water/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand">
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <form action={r.status === "cancelled" ? restore : cancel}>
                      <button className="rounded-full border border-ink/15 px-3 py-1.5 text-xs font-semibold text-ink/70 transition-colors hover:border-brand hover:text-brand">
                        {r.status === "cancelled" ? "Restore" : "Cancel"}
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
            {registrations.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center text-ink/50">
                  No registrations yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
