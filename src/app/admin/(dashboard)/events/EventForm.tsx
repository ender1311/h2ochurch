import { Field, TextArea, SelectField, SubmitButton } from "@/components/admin/Form";
import type { EventRow } from "@/lib/cms/types";

export function EventForm({
  action,
  event,
}: {
  action: (fd: FormData) => Promise<void>;
  event?: EventRow;
}) {
  const dt = (v: string | null) => (v ? v.slice(0, 16) : undefined);

  return (
    <form action={action} className="rounded-3xl border border-ink/10 bg-cream p-8">
      <div className="grid gap-5">
        <Field label="Event name" name="name" defaultValue={event?.name} required />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Starts" name="starts_at" type="datetime-local" defaultValue={dt(event?.starts_at ?? null)} />
          <Field label="Ends" name="ends_at" type="datetime-local" defaultValue={dt(event?.ends_at ?? null)} />
          <Field label="Location" name="location" defaultValue={event?.location} />
          <Field label="Capacity (blank = unlimited)" name="capacity" type="number" defaultValue={event?.capacity ?? undefined} />
          <Field
            label="Cost ($)"
            name="cost"
            type="number"
            step="0.01"
            defaultValue={event ? (event.cost_cents / 100).toFixed(2) : undefined}
          />
          <SelectField
            label="Visibility"
            name="visibility"
            defaultValue={event?.visibility ?? "listed"}
            options={[
              { value: "listed", label: "Listed (public)" },
              { value: "unlisted", label: "Unlisted" },
            ]}
          />
        </div>
        <label className="flex items-center gap-3 text-sm font-semibold text-ink">
          <input
            type="checkbox"
            name="registration_open"
            defaultChecked={event ? event.registration_open : true}
            className="h-5 w-5 rounded border-ink/30 text-brand"
          />
          Registration open
        </label>
        <TextArea label="Description" name="description" defaultValue={event?.description} rows={5} />
      </div>
      <div className="mt-6">
        <SubmitButton>Save event</SubmitButton>
      </div>
    </form>
  );
}
