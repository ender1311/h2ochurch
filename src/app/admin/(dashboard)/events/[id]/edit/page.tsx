import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/admin";
import { updateEvent } from "@/lib/cms/actions/events";
import { EventForm } from "../../EventForm";
import type { EventRow } from "@/lib/cms/types";

export const dynamic = "force-dynamic";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: event } = await supabase.from("events").select("*").eq("id", id).single();
  if (!event) notFound();

  const update = updateEvent.bind(null, id);

  return (
    <div>
      <Link href={`/admin/events/${id}`} className="text-sm font-semibold text-ink/50 hover:text-brand">
        ← Back to event
      </Link>
      <h1 className="mt-6 mb-8 font-display text-4xl font-extrabold text-ink">Edit {event.name}</h1>
      <EventForm action={update} event={event as EventRow} />
    </div>
  );
}
