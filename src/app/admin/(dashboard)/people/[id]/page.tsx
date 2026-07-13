import Link from "next/link";
import { notFound } from "next/navigation";
import { getPersonWithGroups, listFieldDefinitions, getPersonFieldValues } from "@/lib/cms/queries";
import { deletePerson, saveCustomField } from "@/lib/cms/actions/people";
import { DeleteButton } from "@/components/admin/DeleteButton";
import type { FieldDefinition } from "@/lib/cms/types";

export const dynamic = "force-dynamic";

export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [person, fieldDefs, fieldValues] = await Promise.all([
    getPersonWithGroups(id),
    listFieldDefinitions() as Promise<FieldDefinition[]>,
    getPersonFieldValues(id),
  ]);
  if (!person) notFound();

  const initials = `${person.first_name[0] ?? ""}${person.last_name[0] ?? ""}`;
  const remove = deletePerson.bind(null, id);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <Link href="/admin/people" className="text-sm font-semibold text-ink/50 hover:text-brand">
          ← Back to people
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/people/${id}/edit`}
            className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-bold uppercase tracking-widest text-ink transition-colors hover:border-brand hover:text-brand"
          >
            Edit
          </Link>
          <DeleteButton action={remove} label="Delete" confirm={`Delete ${person.first_name} ${person.last_name}?`} />
        </div>
      </div>

      <div className="mt-6 flex items-center gap-5">
        <span
          className="flex h-20 w-20 items-center justify-center rounded-full font-display text-2xl font-extrabold text-cream"
          style={{ background: "linear-gradient(150deg, #1e9bd7 0%, #0e6ba0 55%, #0b3a52 100%)" }}
        >
          {initials}
        </span>
        <div>
          <h1 className="font-display text-4xl font-extrabold text-ink">
            {person.first_name} {person.last_name}
          </h1>
          <span className="mt-1 inline-block rounded-full bg-water/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand">
            {person.status}
          </span>
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <div className="rounded-3xl border border-ink/10 bg-cream p-7">
          <h2 className="text-xs font-bold uppercase tracking-widest text-ink/50">Contact</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-ink/50">Email</dt>
              <dd className="text-right font-medium text-ink">{person.email ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink/50">Phone</dt>
              <dd className="text-right font-medium text-ink">{person.phone ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink/50">Campus</dt>
              <dd className="text-right font-medium text-ink">{person.campus ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink/50">Birthdate</dt>
              <dd className="text-right font-medium text-ink">{person.birthdate ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink/50">Address</dt>
              <dd className="text-right font-medium text-ink">{person.address ?? "—"}</dd>
            </div>
          </dl>
          {person.tags?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {person.tags.map((t) => (
                <Link
                  key={t}
                  href={`/admin/people?tag=${encodeURIComponent(t)}`}
                  className="rounded-full bg-water/10 px-3 py-1 text-xs font-semibold text-brand hover:bg-water/20"
                >
                  #{t}
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        <div className="rounded-3xl border border-ink/10 bg-cream p-7">
          <h2 className="text-xs font-bold uppercase tracking-widest text-ink/50">
            Groups ({person.groups.length})
          </h2>
          <div className="mt-4 flex flex-col gap-2">
            {person.groups.map((g) => (
              <Link
                key={g.group.id}
                href={`/admin/groups/${g.group.id}`}
                className="flex items-center justify-between rounded-xl border border-ink/10 px-4 py-3 transition-colors hover:border-brand hover:bg-water/5"
              >
                <span className="font-medium text-ink">{g.group.name}</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-ink/40">
                  {g.role}
                </span>
              </Link>
            ))}
            {person.groups.length === 0 ? (
              <p className="text-sm text-ink/50">Not in any groups yet.</p>
            ) : null}
          </div>
        </div>
      </div>

      {fieldDefs.length ? (
        <div className="mt-5 rounded-3xl border border-ink/10 bg-cream p-7">
          <h2 className="text-xs font-bold uppercase tracking-widest text-ink/50">Custom fields</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {fieldDefs.map((f) => {
              const save = saveCustomField.bind(null, id, f.id);
              const inputType = f.kind === "number" ? "number" : f.kind === "date" ? "date" : "text";
              return (
                <form key={f.id} action={save} className="flex items-end gap-2">
                  <label className="flex-1">
                    <span className="block text-xs font-semibold uppercase tracking-wider text-ink/50">
                      {f.label}
                    </span>
                    {f.kind === "boolean" ? (
                      <select
                        name="value"
                        defaultValue={fieldValues.get(f.id) ?? ""}
                        className="mt-1 w-full rounded-xl border border-ink/15 bg-paper px-3 py-2 text-sm outline-none focus:border-brand"
                      >
                        <option value="">—</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    ) : (
                      <input
                        name="value"
                        type={inputType}
                        defaultValue={fieldValues.get(f.id) ?? ""}
                        className="mt-1 w-full rounded-xl border border-ink/15 bg-paper px-3 py-2 text-sm outline-none focus:border-brand"
                      />
                    )}
                  </label>
                  <button className="rounded-full border border-ink/15 px-4 py-2 text-xs font-semibold text-ink/70 transition-colors hover:border-brand hover:text-brand">
                    Save
                  </button>
                </form>
              );
            })}
          </div>
        </div>
      ) : null}

      {person.notes ? (
        <div className="mt-5 rounded-3xl border border-ink/10 bg-cream p-7">
          <h2 className="text-xs font-bold uppercase tracking-widest text-ink/50">Notes</h2>
          <p className="mt-3 whitespace-pre-wrap text-ink/70">{person.notes}</p>
        </div>
      ) : null}
    </div>
  );
}
