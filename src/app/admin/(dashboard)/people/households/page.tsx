import Link from "next/link";
import { listHouseholdsWithCounts } from "@/lib/cms/queries";
import { createHousehold, deleteHousehold } from "@/lib/cms/actions/people";

export const dynamic = "force-dynamic";
export const metadata = { title: "Households — H2O Hub" };

export default async function HouseholdsPage() {
  const households = await listHouseholdsWithCounts();

  return (
    <div>
      <Link href="/admin/people" className="text-sm font-semibold text-ink/50 hover:text-brand">
        ← Back to people
      </Link>
      <h1 className="mt-6 font-display text-4xl font-extrabold text-ink">Households</h1>
      <p className="mt-1 text-ink/60">
        Group family members together. Assign people to a household from their profile.
      </p>

      <form action={createHousehold} className="mt-8 flex max-w-lg gap-3">
        <input
          name="name"
          required
          placeholder="e.g. The Borsos Family"
          className="flex-1 rounded-xl border border-ink/15 bg-cream px-4 py-2.5 outline-none focus:border-brand"
        />
        <button className="rounded-full bg-brand px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-cream transition-colors hover:bg-water">
          Add
        </button>
      </form>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {households.map((h) => {
          const remove = deleteHousehold.bind(null, h.id);
          return (
            <div key={h.id} className="flex items-center justify-between rounded-2xl border border-ink/10 bg-cream px-6 py-5">
              <div>
                <p className="font-display text-lg font-bold text-ink">{h.name}</p>
                <p className="text-xs uppercase tracking-wider text-ink/40">
                  {h.member_count} {h.member_count === 1 ? "member" : "members"}
                </p>
              </div>
              <form action={remove}>
                <button className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50">
                  Delete
                </button>
              </form>
            </div>
          );
        })}
        {households.length === 0 ? (
          <p className="text-ink/50">No households yet.</p>
        ) : null}
      </div>
    </div>
  );
}
