import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/admin";
import { updateCalendarEvent } from "@/lib/cms/actions/calendar";
import { Field, TextArea, SubmitButton } from "@/components/admin/Form";
import type { CalendarEvent } from "@/lib/cms/types";

export const dynamic = "force-dynamic";

export default async function EditCalendarEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data } = await supabase.from("calendar_events").select("*").eq("id", id).single();
  if (!data) notFound();
  const e = data as CalendarEvent;
  const update = updateCalendarEvent.bind(null, id);
  const dt = (v: string | null) => (v ? v.slice(0, 16) : undefined);

  return (
    <div>
      <Link href="/admin/calendar" className="text-sm font-semibold text-ink/50 hover:text-brand">
        ← Back to calendar
      </Link>
      <h1 className="mt-6 mb-8 font-display text-4xl font-extrabold text-ink">Edit event</h1>
      <form action={update} className="max-w-xl rounded-3xl border border-ink/10 bg-cream p-8">
        <div className="grid gap-4">
          <Field label="Title" name="title" defaultValue={e.title} required />
          <Field label="Starts" name="starts_at" type="datetime-local" defaultValue={dt(e.starts_at)} required />
          <Field label="Ends" name="ends_at" type="datetime-local" defaultValue={dt(e.ends_at)} />
          <Field label="Location" name="location" defaultValue={e.location} />
          <label className="flex items-center gap-3 text-sm font-semibold text-ink">
            <input type="checkbox" name="all_day" defaultChecked={e.all_day} className="h-5 w-5 rounded border-ink/30 text-brand" />
            All day
          </label>
          <TextArea label="Description" name="description" defaultValue={e.description} rows={3} />
          <SubmitButton>Save event</SubmitButton>
        </div>
      </form>
    </div>
  );
}
