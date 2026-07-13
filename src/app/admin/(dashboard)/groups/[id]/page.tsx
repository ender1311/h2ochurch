import Link from "next/link";
import { notFound } from "next/navigation";
import { getGroupWithMembers, listPeople } from "@/lib/cms/queries";
import { addMember, removeMember, setMemberRole, deleteGroup } from "@/lib/cms/actions/groups";
import { approveRequest, declineRequest } from "@/lib/cms/actions/join-requests";
import { createAdminClient } from "@/utils/supabase/admin";
import { DeleteButton } from "@/components/admin/DeleteButton";
import type { JoinRequest } from "@/lib/cms/join-requests";

export const dynamic = "force-dynamic";

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabaseAdmin = createAdminClient();
  const [group, allPeople, { data: pendingData }] = await Promise.all([
    getGroupWithMembers(id),
    listPeople(),
    supabaseAdmin
      .from("group_join_requests")
      .select("*")
      .eq("group_id", id)
      .eq("status", "pending")
      .order("created_at"),
  ]);
  if (!group) notFound();
  const pending = (pendingData ?? []) as JoinRequest[];

  const memberIds = new Set(group.members.map((m) => m.person.id));
  const candidates = allPeople.filter((p) => !memberIds.has(p.id));
  const addToGroup = addMember.bind(null, id);
  const remove = deleteGroup.bind(null, id);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <Link href="/admin/groups" className="text-sm font-semibold text-ink/50 hover:text-brand">
          ← Back to groups
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/groups/${id}/edit`}
            className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-bold uppercase tracking-widest text-ink transition-colors hover:border-brand hover:text-brand"
          >
            Edit
          </Link>
          <DeleteButton action={remove} confirm={`Delete ${group.name}? Members stay, membership links are removed.`} />
        </div>
      </div>

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

      {/* Pending join requests */}
      {pending.length ? (
        <div className="mt-8 rounded-2xl border border-brand/25 bg-foam/40 p-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-brand">
            Join requests ({pending.length})
          </h2>
          <div className="mt-3 grid gap-3">
            {pending.map((r) => {
              const approve = approveRequest.bind(null, id, r.id);
              const decline = declineRequest.bind(null, id, r.id);
              return (
                <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-cream px-5 py-4">
                  <div>
                    <p className="font-semibold text-ink">
                      {r.first_name} {r.last_name}
                    </p>
                    <p className="text-xs text-ink/50">
                      {[r.email, r.phone].filter(Boolean).join(" · ") || "No contact info"}
                    </p>
                    {r.message ? <p className="mt-1 text-sm italic text-ink/60">“{r.message}”</p> : null}
                  </div>
                  <div className="flex gap-2">
                    <form action={approve}>
                      <button className="rounded-full bg-brand px-5 py-2 text-xs font-bold uppercase tracking-widest text-cream transition-colors hover:bg-water">
                        Approve
                      </button>
                    </form>
                    <form action={decline}>
                      <button className="rounded-full border border-ink/15 px-5 py-2 text-xs font-bold uppercase tracking-widest text-ink/60 transition-colors hover:border-red-300 hover:text-red-600">
                        Decline
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Add member */}
      <form action={addToGroup} className="mt-8 flex flex-wrap items-end gap-3 rounded-2xl border border-ink/10 bg-cream p-5">
        <label className="flex-1">
          <span className="block text-xs font-bold uppercase tracking-widest text-ink/50">Add member</span>
          <select
            name="person_id"
            required
            className="mt-1.5 w-full rounded-xl border border-ink/15 bg-paper px-4 py-2.5 text-ink outline-none focus:border-brand"
          >
            <option value="">Choose a person…</option>
            {candidates.map((p) => (
              <option key={p.id} value={p.id}>
                {p.first_name} {p.last_name}
              </option>
            ))}
          </select>
        </label>
        <select name="role" className="rounded-xl border border-ink/15 bg-paper px-4 py-2.5 text-ink outline-none focus:border-brand">
          <option value="member">Member</option>
          <option value="leader">Leader</option>
        </select>
        <button className="rounded-full bg-brand px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-cream transition-colors hover:bg-water">
          Add
        </button>
      </form>

      {/* Members */}
      <div className="mt-6 overflow-hidden rounded-3xl border border-ink/10 bg-cream">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 bg-sand/50 text-xs font-bold uppercase tracking-widest text-ink/50">
            <tr>
              <th className="px-6 py-4">Member</th>
              <th className="hidden px-6 py-4 sm:table-cell">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/8">
            {group.members.map((m) => {
              const toggleRole = setMemberRole.bind(
                null,
                id,
                m.person.id,
                m.role === "leader" ? "member" : "leader",
              );
              const removeMemberBound = removeMember.bind(null, id, m.person.id);
              return (
                <tr key={m.person.id} className="hover:bg-water/5">
                  <td className="px-6 py-4">
                    <Link href={`/admin/people/${m.person.id}`} className="font-semibold text-ink hover:text-brand">
                      {m.person.first_name} {m.person.last_name}
                    </Link>
                  </td>
                  <td className="hidden px-6 py-4 text-ink/70 sm:table-cell">{m.person.email ?? "—"}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                        m.role === "leader" ? "bg-brand text-cream" : "bg-water/10 text-brand"
                      }`}
                    >
                      {m.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <form action={toggleRole}>
                        <button className="rounded-full border border-ink/15 px-3 py-1.5 text-xs font-semibold text-ink/70 transition-colors hover:border-brand hover:text-brand">
                          Make {m.role === "leader" ? "member" : "leader"}
                        </button>
                      </form>
                      <form action={removeMemberBound}>
                        <button className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50">
                          Remove
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
            {group.members.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center text-ink/50">
                  No members yet. Add someone above.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
