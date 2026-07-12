import { Field, TextArea, SelectField, SubmitButton } from "@/components/admin/Form";
import type { Group } from "@/lib/cms/types";

export function GroupForm({
  action,
  group,
}: {
  action: (fd: FormData) => Promise<void>;
  group?: Group;
}) {
  return (
    <form action={action} className="rounded-3xl border border-ink/10 bg-cream p-8">
      <div className="grid gap-5">
        <Field label="Name" name="name" defaultValue={group?.name} required />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Schedule" name="schedule" defaultValue={group?.schedule} placeholder="Wednesdays 7pm" />
          <Field label="Location" name="location" defaultValue={group?.location} />
        </div>
        <SelectField
          label="Visibility"
          name="visibility"
          defaultValue={group?.visibility ?? "listed"}
          options={[
            { value: "listed", label: "Listed (public)" },
            { value: "unlisted", label: "Unlisted (hidden)" },
          ]}
        />
        <TextArea label="Description" name="description" defaultValue={group?.description} />
      </div>
      <div className="mt-6">
        <SubmitButton>Save group</SubmitButton>
      </div>
    </form>
  );
}
