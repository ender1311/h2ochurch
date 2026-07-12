import Link from "next/link";
import { createEvent } from "@/lib/cms/actions/events";
import { EventForm } from "../EventForm";

export const metadata = { title: "New event — H2O Hub" };

export default function NewEventPage() {
  return (
    <div>
      <Link href="/admin/events" className="text-sm font-semibold text-ink/50 hover:text-brand">
        ← Back to events
      </Link>
      <h1 className="mt-6 mb-8 font-display text-4xl font-extrabold text-ink">New event</h1>
      <EventForm action={createEvent} />
    </div>
  );
}
