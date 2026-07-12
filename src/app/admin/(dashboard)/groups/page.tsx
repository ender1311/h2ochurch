import Link from "next/link";
import { listGroupsWithCounts } from "@/lib/cms/queries";

export const dynamic = "force-dynamic";
export const metadata = { title: "Groups — H2O Hub" };

export default async function GroupsPage() {
  const groups = await listGroupsWithCounts();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-extrabold text-ink">Groups</h1>
          <p className="mt-1 text-ink/60">{groups.length} groups</p>
        </div>
        <a
          href="/admin/groups/export"
          className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-bold uppercase tracking-widest text-ink transition-colors hover:border-brand hover:text-brand"
        >
          Export CSV
        </a>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((g) => (
          <Link
            key={g.id}
            href={`/admin/groups/${g.id}`}
            className="group flex flex-col rounded-3xl border border-ink/10 bg-cream p-6 transition-all duration-300 hover:-translate-y-1 hover:border-water/30 hover:shadow-[0_30px_70px_-45px_rgba(11,58,82,0.5)]"
          >
            <div className="flex items-start justify-between">
              <h2 className="font-display text-xl font-bold text-ink">{g.name}</h2>
              <span
                className={`rounded-full px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider ${
                  g.visibility === "listed"
                    ? "bg-water/10 text-brand"
                    : "bg-ink/5 text-ink/40"
                }`}
              >
                {g.visibility}
              </span>
            </div>
            {g.schedule ? <p className="mt-2 text-sm text-ink/60">{g.schedule}</p> : null}
            <p className="mt-6 font-display text-3xl font-extrabold text-brand">
              {g.member_count}
              <span className="ml-1 text-sm font-semibold text-ink/40">
                {g.member_count === 1 ? "member" : "members"}
              </span>
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
