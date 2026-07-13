import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/utils/supabase/admin";
import { inviteUser, setUserRole } from "@/lib/cms/actions/users";

export const dynamic = "force-dynamic";
export const metadata = { title: "Users — H2O Hub" };

const ROLES = ["admin", "staff", "leader", "member"];

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string;
  role: string;
  created_at: string;
};

export default async function UsersPage() {
  const me = await requireAdmin();
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .order("created_at");
  const users = (data ?? []) as ProfileRow[];

  return (
    <div>
      <Link href="/admin/settings" className="text-sm font-semibold text-ink/50 hover:text-brand">
        ← Back to settings
      </Link>
      <h1 className="mt-6 font-display text-4xl font-extrabold text-ink">Users &amp; roles</h1>
      <p className="mt-1 text-ink/60">Invite staff and control who can access the Hub.</p>

      {/* Invite */}
      <form action={inviteUser} className="mt-8 flex flex-wrap items-end gap-3 rounded-2xl border border-ink/10 bg-cream p-5">
        <label className="flex-1">
          <span className="block text-xs font-bold uppercase tracking-widest text-ink/50">Invite by email</span>
          <input name="email" type="email" required placeholder="person@example.com" className="mt-1.5 w-full rounded-xl border border-ink/15 bg-paper px-4 py-2.5 outline-none focus:border-brand" />
        </label>
        <select name="role" defaultValue="staff" className="rounded-xl border border-ink/15 bg-paper px-4 py-2.5 outline-none focus:border-brand">
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <button className="rounded-full bg-brand px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-cream transition-colors hover:bg-water">
          Send invite
        </button>
      </form>
      <p className="mt-2 text-xs text-ink/40">
        Invited users get an email with a link to set their password (expires in 24 hours). Only
        admins &amp; staff can sign in to the Hub.
      </p>

      {/* Users */}
      <div className="mt-6 overflow-hidden rounded-3xl border border-ink/10 bg-cream">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 bg-sand/50 text-xs font-bold uppercase tracking-widest text-ink/50">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4 text-right">Update</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/8">
            {users.map((u) => {
              const update = setUserRole.bind(null, u.id);
              const isMe = u.id === me.userId;
              return (
                <tr key={u.id} className="hover:bg-water/5">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-ink">{u.full_name || u.email}</span>
                    {isMe ? <span className="ml-2 text-xs text-ink/40">(you)</span> : null}
                    <span className="block text-xs text-ink/40">{u.email}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-water/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <form action={update} className="flex items-center justify-end gap-2">
                      <select name="role" defaultValue={u.role} className="rounded-lg border border-ink/15 bg-paper px-3 py-1.5 text-sm outline-none focus:border-brand">
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <button className="rounded-full border border-ink/15 px-3 py-1.5 text-xs font-semibold text-ink/70 transition-colors hover:border-brand hover:text-brand">
                        Save
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
