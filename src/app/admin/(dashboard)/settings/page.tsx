import Link from "next/link";
import { requireStaff } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings — H2O Hub" };

export default async function SettingsPage() {
  const profile = await requireStaff();

  return (
    <div>
      <h1 className="font-display text-4xl font-extrabold text-ink">Settings</h1>
      <p className="mt-1 text-ink/60">Signed in as {profile.email} · {profile.role}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {profile.role === "admin" ? (
          <Link
            href="/admin/settings/users"
            className="rounded-3xl border border-ink/10 bg-cream p-7 transition-colors hover:border-brand"
          >
            <h2 className="font-display text-xl font-bold text-ink">Users &amp; roles</h2>
            <p className="mt-1 text-sm text-ink/60">Invite staff and manage who can access the Hub.</p>
          </Link>
        ) : (
          <div className="rounded-3xl border border-ink/10 bg-cream p-7 opacity-60">
            <h2 className="font-display text-xl font-bold text-ink">Users &amp; roles</h2>
            <p className="mt-1 text-sm text-ink/60">Admins only.</p>
          </div>
        )}
        <Link
          href="/admin/import"
          className="rounded-3xl border border-ink/10 bg-cream p-7 transition-colors hover:border-brand"
        >
          <h2 className="font-display text-xl font-bold text-ink">Import / Export</h2>
          <p className="mt-1 text-sm text-ink/60">Move data in and out via CSV.</p>
        </Link>
        <Link
          href="/admin/settings/fields"
          className="rounded-3xl border border-ink/10 bg-cream p-7 transition-colors hover:border-brand"
        >
          <h2 className="font-display text-xl font-bold text-ink">Custom fields</h2>
          <p className="mt-1 text-sm text-ink/60">Define extra fields tracked on every person.</p>
        </Link>
        <Link
          href="/admin/people/households"
          className="rounded-3xl border border-ink/10 bg-cream p-7 transition-colors hover:border-brand"
        >
          <h2 className="font-display text-xl font-bold text-ink">Households</h2>
          <p className="mt-1 text-sm text-ink/60">Group family members together.</p>
        </Link>
      </div>
    </div>
  );
}
