import Link from "next/link";
import { listFieldDefinitions } from "@/lib/cms/queries";
import { createFieldDefinition, deleteFieldDefinition } from "@/lib/cms/actions/people";
import type { FieldDefinition } from "@/lib/cms/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Custom fields — H2O Hub" };

export default async function FieldsPage() {
  const fields = (await listFieldDefinitions()) as FieldDefinition[];

  return (
    <div>
      <Link href="/admin/settings" className="text-sm font-semibold text-ink/50 hover:text-brand">
        ← Back to settings
      </Link>
      <h1 className="mt-6 font-display text-4xl font-extrabold text-ink">Custom fields</h1>
      <p className="mt-1 max-w-xl text-ink/60">
        Track anything extra about people — graduation year, dorm, T-shirt size. Fields appear on
        every person&apos;s profile.
      </p>

      <form action={createFieldDefinition} className="mt-8 flex max-w-xl flex-wrap gap-3">
        <input
          name="label"
          required
          placeholder="Field name, e.g. Graduation Year"
          className="min-w-52 flex-1 rounded-xl border border-ink/15 bg-cream px-4 py-2.5 outline-none focus:border-brand"
        />
        <select name="kind" className="rounded-xl border border-ink/15 bg-cream px-4 py-2.5 outline-none focus:border-brand">
          <option value="text">Text</option>
          <option value="number">Number</option>
          <option value="date">Date</option>
          <option value="boolean">Yes / No</option>
        </select>
        <button className="rounded-full bg-brand px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-cream transition-colors hover:bg-water">
          Add field
        </button>
      </form>

      <div className="mt-6 grid max-w-xl gap-3">
        {fields.map((f) => {
          const remove = deleteFieldDefinition.bind(null, f.id);
          return (
            <div key={f.id} className="flex items-center justify-between rounded-2xl border border-ink/10 bg-cream px-6 py-4">
              <div>
                <p className="font-semibold text-ink">{f.label}</p>
                <p className="text-xs uppercase tracking-wider text-ink/40">{f.kind}</p>
              </div>
              <form action={remove}>
                <button className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50">
                  Delete
                </button>
              </form>
            </div>
          );
        })}
        {fields.length === 0 ? <p className="text-ink/50">No custom fields yet.</p> : null}
      </div>
    </div>
  );
}
