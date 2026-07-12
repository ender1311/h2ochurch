import Link from "next/link";
import { notFound } from "next/navigation";
import { getGroupWithMembers } from "@/lib/cms/queries";

export const dynamic = "force-dynamic";

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const group = await getGroupWithMembers(id);
  if (!group) notFound();

  const leaders = group.members.filter((m) => m.role === "leader");
  const members = group.members.filter((m) => m.role !== "leader");

  return (
    <div>
      <Link href="/admin/groups" className="text-sm font-semibold text-ink/50 hover:text-brand">
        ← Back to groups
      </Link>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-extrabold text-ink">{group.name}</h1>
          <p className="mt-1 text-ink/60">
            {group.members.length} {group.members.length === 1 ? "member" : "members"}
            {group.schedule ? ` · ${group.schedule}` : ""}
          </p>
        </div>
        <span
          className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${
            group.visibility === "listed" ? "bg-water/10 text-brand" : "bg-ink/5 text-ink/40"
          }`}
        >
          {group.visibility}
        </span>
      </div>

      {leaders.length ? (
        <div className="mt-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-ink/50">Leaders</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {leaders.map((m) => (
              <Link
                key={m.person.id}
                href={`/admin/people/${m.person.id}`}
                className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-cream transition-opacity hover:opacity-90"
              >
                {m.person.first_name} {m.person.last_name}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-8 overflow-hidden rounded-3xl border border-ink/10 bg-cream">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 bg-sand/50 text-xs font-bold uppercase tracking-widest text-ink/50">
            <tr>
              <th className="px-6 py-4">Member</th>
              <th className="hidden px-6 py-4 sm:table-cell">Email</th>
              <th className="hidden px-6 py-4 md:table-cell">Phone</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/8">
            {members.map((m) => (
              <tr key={m.person.id} className="transition-colors hover:bg-water/5">
                <td className="px-6 py-4">
                  <Link
                    href={`/admin/people/${m.person.id}`}
                    className="font-semibold text-ink hover:text-brand"
                  >
                    {m.person.first_name} {m.person.last_name}
                  </Link>
                </td>
                <td className="hidden px-6 py-4 text-ink/70 sm:table-cell">
                  {m.person.email ?? "—"}
                </td>
                <td className="hidden px-6 py-4 text-ink/70 md:table-cell">
                  {m.person.phone ?? "—"}
                </td>
              </tr>
            ))}
            {members.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-16 text-center text-ink/50">
                  No members yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
