import Link from "next/link";
import { listPeople } from "@/lib/cms/queries";

export const dynamic = "force-dynamic";
export const metadata = { title: "People — H2O Hub" };

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const people = await listPeople(q);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-extrabold text-ink">People</h1>
          <p className="mt-1 text-ink/60">{people.length} shown</p>
        </div>
        <a
          href={`/admin/people/export${q ? `?q=${encodeURIComponent(q)}` : ""}`}
          className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-bold uppercase tracking-widest text-ink transition-colors hover:border-brand hover:text-brand"
        >
          Export CSV
        </a>
      </div>

      <form className="mt-6" action="/admin/people">
        <div className="flex items-center gap-2 rounded-full border border-ink/15 bg-cream px-5 py-1.5 focus-within:border-brand">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-ink/40" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4-4" strokeLinecap="round" />
          </svg>
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name, email, or phone…"
            className="w-full bg-transparent py-2 text-ink outline-none placeholder:text-ink/40"
          />
          {q ? (
            <Link href="/admin/people" className="text-sm font-semibold text-ink/50 hover:text-ink">
              Clear
            </Link>
          ) : null}
        </div>
      </form>

      <div className="mt-6 overflow-hidden rounded-3xl border border-ink/10 bg-cream">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 bg-sand/50 text-xs font-bold uppercase tracking-widest text-ink/50">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="hidden px-6 py-4 sm:table-cell">Email</th>
              <th className="hidden px-6 py-4 md:table-cell">Phone</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/8">
            {people.map((p) => (
              <tr key={p.id} className="transition-colors hover:bg-water/5">
                <td className="px-6 py-4">
                  <Link
                    href={`/admin/people/${p.id}`}
                    className="font-semibold text-ink hover:text-brand"
                  >
                    {p.first_name} {p.last_name}
                  </Link>
                  <span className="block text-xs text-ink/40 sm:hidden">{p.email}</span>
                </td>
                <td className="hidden px-6 py-4 text-ink/70 sm:table-cell">{p.email ?? "—"}</td>
                <td className="hidden px-6 py-4 text-ink/70 md:table-cell">{p.phone ?? "—"}</td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-water/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand">
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
            {people.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center text-ink/50">
                  No people found{q ? ` for “${q}”` : ""}.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
