import Link from "next/link";
import { createAdminClient } from "@/utils/supabase/admin";
import { createCalendarEvent, deleteCalendarEvent } from "@/lib/cms/actions/calendar";
import { Field, TextArea, SubmitButton } from "@/components/admin/Form";
import type { CalendarEvent } from "@/lib/cms/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Calendar — H2O Hub" };

function fmt(v: string, allDay: boolean) {
  const d = new Date(v);
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    ...(allDay ? {} : { hour: "numeric", minute: "2-digit" }),
  });
}

export default async function CalendarPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("calendar_events")
    .select("*")
    .order("starts_at", { ascending: true });
  const events = (data ?? []) as CalendarEvent[];

  const now = Date.now();
  const upcoming = events.filter((e) => new Date(e.ends_at ?? e.starts_at).getTime() >= now);
  const past = events.filter((e) => new Date(e.ends_at ?? e.starts_at).getTime() < now).reverse();

  return (
    <div>
      <h1 className="font-display text-4xl font-extrabold text-ink">Calendar</h1>
      <p className="mt-1 text-ink/60">The church calendar at a glance.</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        {/* Create */}
        <form action={createCalendarEvent} className="h-fit rounded-3xl border border-ink/10 bg-cream p-7">
          <h2 className="mb-4 font-display text-xl font-bold text-ink">Add to calendar</h2>
          <div className="grid gap-4">
            <Field label="Title" name="title" required />
            <Field label="Starts" name="starts_at" type="datetime-local" required />
            <Field label="Ends" name="ends_at" type="datetime-local" />
            <Field label="Location" name="location" />
            <label className="flex items-center gap-3 text-sm font-semibold text-ink">
              <input type="checkbox" name="all_day" className="h-5 w-5 rounded border-ink/30 text-brand" />
              All day
            </label>
            <TextArea label="Description" name="description" rows={3} />
            <SubmitButton>Add event</SubmitButton>
          </div>
        </form>

        {/* Lists */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-brand">Upcoming</h2>
          <div className="mt-4 grid gap-3">
            {upcoming.map((e) => (
              <EventRow key={e.id} e={e} />
            ))}
            {upcoming.length === 0 ? <p className="text-ink/50">Nothing upcoming.</p> : null}
          </div>

          {past.length ? (
            <>
              <h2 className="mt-10 text-xs font-bold uppercase tracking-widest text-ink/40">Past</h2>
              <div className="mt-4 grid gap-3 opacity-60">
                {past.slice(0, 10).map((e) => (
                  <EventRow key={e.id} e={e} />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );

  function EventRow({ e }: { e: CalendarEvent }) {
    const remove = deleteCalendarEvent.bind(null, e.id);
    return (
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-ink/10 bg-cream p-5">
        <div>
          <p className="font-display text-lg font-bold text-ink">{e.title}</p>
          <p className="mt-0.5 text-sm text-ink/55">
            {fmt(e.starts_at, e.all_day)}
            {e.location ? ` · ${e.location}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/calendar/${e.id}/edit`}
            className="rounded-full border border-ink/15 px-3 py-1.5 text-xs font-semibold text-ink/70 transition-colors hover:border-brand hover:text-brand"
          >
            Edit
          </Link>
          <form action={remove}>
            <button className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50">
              Delete
            </button>
          </form>
        </div>
      </div>
    );
  }
}
