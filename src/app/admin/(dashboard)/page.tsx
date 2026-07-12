import Link from "next/link";
import { getStats } from "@/lib/cms/queries";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const stats = await getStats();

  const cards = [
    { label: "People", value: stats.people, href: "/admin/people", hint: "in your directory" },
    { label: "Groups", value: stats.groups, href: "/admin/groups", hint: "active groups" },
    { label: "Memberships", value: stats.memberships, href: "/admin/groups", hint: "group connections" },
  ];

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.35em] text-brand">H2O Hub</p>
      <h1 className="mt-2 font-display text-4xl font-extrabold text-ink">Dashboard</h1>
      <p className="mt-2 text-ink/60">Your church, in one place.</p>

      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="group rounded-3xl border border-ink/10 bg-cream p-7 transition-all duration-300 hover:-translate-y-1 hover:border-water/30 hover:shadow-[0_30px_70px_-45px_rgba(11,58,82,0.5)]"
          >
            <p className="text-sm font-bold uppercase tracking-widest text-ink/50">{c.label}</p>
            <p className="mt-3 font-display text-6xl font-extrabold text-brand">{c.value}</p>
            <p className="mt-2 text-sm text-ink/50">{c.hint}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        <Link
          href="/admin/import"
          className="rounded-3xl border border-dashed border-ink/20 bg-transparent p-7 transition-colors hover:border-brand hover:bg-cream"
        >
          <h2 className="font-display text-xl font-bold text-ink">Import / Export</h2>
          <p className="mt-2 text-sm text-ink/60">
            Bring in a CSV from Planning Center or export your data anytime.
          </p>
        </Link>
        <Link
          href="/admin/people"
          className="rounded-3xl border border-dashed border-ink/20 bg-transparent p-7 transition-colors hover:border-brand hover:bg-cream"
        >
          <h2 className="font-display text-xl font-bold text-ink">Manage People</h2>
          <p className="mt-2 text-sm text-ink/60">Search the directory and view who&apos;s in what group.</p>
        </Link>
      </div>
    </div>
  );
}
