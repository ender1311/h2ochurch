import Link from "next/link";
import { createAdminClient } from "@/utils/supabase/admin";
import { createTeam, deleteTeam, addTeamMember, removeTeamMember } from "@/lib/cms/actions/services";

export const dynamic = "force-dynamic";
export const metadata = { title: "Teams — H2O Hub" };

type TeamRow = {
  id: string;
  name: string;
  team_members: { role: string | null; people: { id: string; first_name: string; last_name: string } | null }[];
};

export default async function TeamsPage() {
  const supabase = createAdminClient();
  const [{ data: teamRows }, { data: people }] = await Promise.all([
    supabase.from("teams").select("id, name, team_members(role, people(id, first_name, last_name))").order("name"),
    supabase.from("people").select("id, first_name, last_name").order("last_name"),
  ]);
  const teams = (teamRows ?? []) as unknown as TeamRow[];

  return (
    <div>
      <Link href="/admin/services" className="text-sm font-semibold text-ink/50 hover:text-brand">
        ← Back to services
      </Link>
      <h1 className="mt-6 font-display text-4xl font-extrabold text-ink">Teams</h1>
      <p className="mt-1 text-ink/60">Worship, sound, hospitality — the crews that make Sundays happen.</p>

      <form action={createTeam} className="mt-8 flex max-w-lg gap-3">
        <input name="name" required placeholder="e.g. Worship Team" className="flex-1 rounded-xl border border-ink/15 bg-cream px-4 py-2.5 outline-none focus:border-brand" />
        <button className="rounded-full bg-brand px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-cream transition-colors hover:bg-water">
          Add team
        </button>
      </form>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {teams.map((t) => {
          const removeTeamBound = deleteTeam.bind(null, t.id);
          const addMemberBound = addTeamMember.bind(null, t.id);
          const memberIds = new Set(t.team_members.map((m) => m.people?.id).filter(Boolean));
          return (
            <div key={t.id} className="rounded-3xl border border-ink/10 bg-cream p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-ink">{t.name}</h2>
                <form action={removeTeamBound}>
                  <button className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50">
                    Delete
                  </button>
                </form>
              </div>

              <div className="mt-4 grid gap-2">
                {t.team_members.map((m) =>
                  m.people ? (
                    <MemberRow key={m.people.id} teamId={t.id} personId={m.people.id}
                      name={`${m.people.first_name} ${m.people.last_name}`} role={m.role} />
                  ) : null,
                )}
                {t.team_members.length === 0 ? <p className="text-sm text-ink/50">No members yet.</p> : null}
              </div>

              <form action={addMemberBound} className="mt-4 flex gap-2">
                <select name="person_id" required className="min-w-0 flex-1 rounded-xl border border-ink/15 bg-paper px-3 py-2 text-sm outline-none focus:border-brand">
                  <option value="">Add person…</option>
                  {(people ?? [])
                    .filter((p) => !memberIds.has(p.id))
                    .map((p) => (
                      <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                    ))}
                </select>
                <input name="role" placeholder="Role" className="w-28 rounded-xl border border-ink/15 bg-paper px-3 py-2 text-sm outline-none focus:border-brand" />
                <button className="rounded-full bg-brand px-4 py-2 text-xs font-bold uppercase tracking-widest text-cream transition-colors hover:bg-water">
                  Add
                </button>
              </form>
            </div>
          );
        })}
        {teams.length === 0 ? <p className="text-ink/50">No teams yet.</p> : null}
      </div>
    </div>
  );
}

function MemberRow({ teamId, personId, name, role }: { teamId: string; personId: string; name: string; role: string | null }) {
  const remove = removeTeamMember.bind(null, teamId, personId);
  return (
    <div className="flex items-center justify-between rounded-xl border border-ink/10 px-4 py-2.5">
      <div>
        <span className="text-sm font-semibold text-ink">{name}</span>
        {role ? <span className="ml-2 text-xs uppercase tracking-wider text-ink/40">{role}</span> : null}
      </div>
      <form action={remove}>
        <button className="text-xs font-semibold text-red-500 hover:text-red-700">Remove</button>
      </form>
    </div>
  );
}
