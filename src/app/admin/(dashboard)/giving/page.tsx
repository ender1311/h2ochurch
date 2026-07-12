import { createAdminClient } from "@/utils/supabase/admin";
import { createFund, recordDonation, deleteDonation } from "@/lib/cms/actions/giving";
import { DeleteButton } from "@/components/admin/DeleteButton";
import type { Fund, Person } from "@/lib/cms/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Giving — H2O Hub" };

type DonationRow = {
  id: string;
  amount_cents: number;
  method: string;
  note: string | null;
  donated_on: string;
  people: { first_name: string; last_name: string } | null;
  funds: { name: string } | null;
};

function money(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

export default async function GivingPage() {
  const supabase = createAdminClient();
  const [{ data: funds }, { data: people }, { data: donations }] = await Promise.all([
    supabase.from("funds").select("*").order("name"),
    supabase.from("people").select("id,first_name,last_name").order("last_name"),
    supabase
      .from("donations")
      .select("*, people(first_name,last_name), funds(name)")
      .order("donated_on", { ascending: false })
      .limit(200),
  ]);

  const fundList = (funds ?? []) as Fund[];
  const peopleList = (people ?? []) as Pick<Person, "id" | "first_name" | "last_name">[];
  const rows = (donations ?? []) as DonationRow[];
  const total = rows.reduce((sum, d) => sum + d.amount_cents, 0);

  return (
    <div>
      <h1 className="font-display text-4xl font-extrabold text-ink">Giving</h1>
      <p className="mt-1 text-ink/60">Record and track donations by fund.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-ink/10 bg-cream p-7">
          <p className="text-sm font-bold uppercase tracking-widest text-ink/50">Total shown</p>
          <p className="mt-2 font-display text-4xl font-extrabold text-brand">{money(total)}</p>
        </div>
        <div className="rounded-3xl border border-ink/10 bg-cream p-7">
          <p className="text-sm font-bold uppercase tracking-widest text-ink/50">Gifts</p>
          <p className="mt-2 font-display text-4xl font-extrabold text-ink">{rows.length}</p>
        </div>
        <div className="rounded-3xl border border-ink/10 bg-cream p-7">
          <p className="text-sm font-bold uppercase tracking-widest text-ink/50">Funds</p>
          <p className="mt-2 font-display text-4xl font-extrabold text-ink">{fundList.length}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {/* Record a gift */}
        <form action={recordDonation} className="rounded-3xl border border-ink/10 bg-cream p-7">
          <h2 className="font-display text-xl font-bold text-ink">Record a gift</h2>
          <div className="mt-4 grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <input name="amount" type="number" step="0.01" required placeholder="Amount" className="rounded-xl border border-ink/15 bg-paper px-4 py-2.5 outline-none focus:border-brand" />
              <input name="donated_on" type="date" className="rounded-xl border border-ink/15 bg-paper px-4 py-2.5 outline-none focus:border-brand" />
            </div>
            <select name="person_id" className="rounded-xl border border-ink/15 bg-paper px-4 py-2.5 outline-none focus:border-brand">
              <option value="">Anonymous / no person</option>
              {peopleList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.last_name}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-4">
              <select name="fund_id" className="rounded-xl border border-ink/15 bg-paper px-4 py-2.5 outline-none focus:border-brand">
                <option value="">General</option>
                {fundList.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
              <select name="method" className="rounded-xl border border-ink/15 bg-paper px-4 py-2.5 outline-none focus:border-brand">
                <option value="online">Online</option>
                <option value="card">Card</option>
                <option value="cash">Cash</option>
                <option value="check">Check</option>
                <option value="other">Other</option>
              </select>
            </div>
            <button className="rounded-full bg-brand px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-cream transition-colors hover:bg-water">
              Record gift
            </button>
          </div>
        </form>

        {/* Add fund */}
        <form action={createFund} className="h-fit rounded-3xl border border-ink/10 bg-cream p-7">
          <h2 className="font-display text-xl font-bold text-ink">Add a fund</h2>
          <div className="mt-4 flex gap-3">
            <input name="name" required placeholder="e.g. Missions, Building" className="flex-1 rounded-xl border border-ink/15 bg-paper px-4 py-2.5 outline-none focus:border-brand" />
            <button className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-bold uppercase tracking-widest text-ink transition-colors hover:border-brand hover:text-brand">
              Add
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {fundList.map((f) => (
              <span key={f.id} className="rounded-full bg-water/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand">
                {f.name}
              </span>
            ))}
          </div>
        </form>
      </div>

      {/* Recent gifts */}
      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-ink">Recent gifts</h2>
        <a href="/admin/giving/export" className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-bold uppercase tracking-widest text-ink transition-colors hover:border-brand hover:text-brand">
          Export CSV
        </a>
      </div>
      <div className="mt-4 overflow-hidden rounded-3xl border border-ink/10 bg-cream">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 bg-sand/50 text-xs font-bold uppercase tracking-widest text-ink/50">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Donor</th>
              <th className="hidden px-6 py-4 sm:table-cell">Fund</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/8">
            {rows.map((d) => {
              const remove = deleteDonation.bind(null, d.id);
              return (
                <tr key={d.id} className="hover:bg-water/5">
                  <td className="px-6 py-4 text-ink/70">{d.donated_on}</td>
                  <td className="px-6 py-4 font-semibold text-ink">
                    {d.people ? `${d.people.first_name} ${d.people.last_name}` : "Anonymous"}
                  </td>
                  <td className="hidden px-6 py-4 text-ink/70 sm:table-cell">{d.funds?.name ?? "General"}</td>
                  <td className="px-6 py-4 font-semibold text-brand">{money(d.amount_cents)}</td>
                  <td className="px-6 py-4 text-right">
                    <form action={remove}>
                      <button className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-ink/50">
                  No gifts recorded yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
