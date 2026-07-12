import { Field, TextArea, SelectField, SubmitButton } from "@/components/admin/Form";
import type { Person, Household } from "@/lib/cms/types";

export function PersonForm({
  action,
  person,
  households,
}: {
  action: (fd: FormData) => Promise<void>;
  person?: Person;
  households: Household[];
}) {
  return (
    <form action={action} className="rounded-3xl border border-ink/10 bg-cream p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="First name" name="first_name" defaultValue={person?.first_name} required />
        <Field label="Last name" name="last_name" defaultValue={person?.last_name} required />
        <Field label="Email" name="email" type="email" defaultValue={person?.email} />
        <Field label="Phone" name="phone" defaultValue={person?.phone} />
        <SelectField
          label="Status"
          name="status"
          defaultValue={person?.status ?? "active"}
          options={[
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
            { value: "prospect", label: "Prospect" },
          ]}
        />
        <Field label="Campus" name="campus" defaultValue={person?.campus} />
        <Field label="Birthdate" name="birthdate" type="date" defaultValue={person?.birthdate} />
        <SelectField
          label="Household"
          name="household_id"
          defaultValue={person?.household_id}
          options={[
            { value: "", label: "— None —" },
            ...households.map((h) => ({ value: h.id, label: h.name })),
          ]}
        />
      </div>
      <div className="mt-5 grid gap-5">
        <Field label="Address" name="address" defaultValue={person?.address} />
        <Field
          label="Tags (comma separated)"
          name="tags"
          defaultValue={person?.tags?.join(", ")}
          placeholder="student, volunteer, new"
        />
        <TextArea label="Notes" name="notes" defaultValue={person?.notes} />
      </div>
      <div className="mt-6">
        <SubmitButton>Save person</SubmitButton>
      </div>
    </form>
  );
}
