import Link from "next/link";
import { createAdminClient } from "@/utils/supabase/admin";
import { createSession } from "@/lib/cms/actions/checkins";
import type { CheckinSession, Group } from "@/lib/cms/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Check-Ins — H2O Hub" };

export default async function CheckinsPage() {
  const supabase = createAdminClient();
  const [{ data: sessions }, { data: groups }] = await Promise.all([
    supabase
      .from("checkin_sessions")
      .select("*, checkins(count), groups(name)")
      .order("session_date", { ascending: false }),
    supabase.from("groups").select("id,name").order("name"),
  ]);

  const rows = (sessions ?? []) as (CheckinSession & {
    checkins: { count: number }[];
    groups: { name: string } | null;
  })[];
  const groupList = (groups ?? []) as Pick<Group, "id" | "name">[];

  return (
    <div>
      <h1 className="font-display text-4xl font-extrabold text-ink">Check-Ins</h1>
      <p className="mt-1 text-ink/60">Track attendance for gatherings and groups.</p>

      <form action={createSession} className="mt-8 flex flex-wrap items-end gap-3 rounded-2xl border border-ink/10 bg-cream p-5">
        <label className="flex-1">
          <span className="block text-xs font-bold uppercase tracking-widest text-ink/50">New session</span>
          <input name="name" required placeholder="Sunday Gathering" className="mt-1.5 w-full rounded-xl border border-ink/15 bg-paper px-4 py-2.5 outline-none focus:border-brand" />
        </label>
        <select name="group_id" className="rounded-xl border border-ink/15 bg-paper px-4 py-2.5 outline-none focus:border-brand">
          <option value="">No group</option>
          {groupList.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        <input name="session_date" type="date" className="rounded-xl border border-ink/15 bg-paper px-4 py-2.5 outline-none focus:border-brand" />
        <button className="rounded-full bg-brand px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-cream transition-colors hover:bg-water">
          Start
        </button>
      </form>

      <div className="mt-6 grid gap-4">
        {rows.map((s) => (
          <Link
            key={s.id}
            href={`/admin/checkins/${s.id}`}
            className="group flex items-center justify-between rounded-3xl border border-ink/10 bg-cream p-6 transition-colors hover:border-water/30"
          >
            <div>
              <h2 className="font-display text-xl font-bold text-ink group-hover:text-brand">{s.name}</h2>
              <p className="mt-1 text-sm text-ink/55">
                {s.session_date}
                {s.groups?.name ? ` · ${s.groups.name}` : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl font-extrabold text-brand">{s.checkins?.[0]?.count ?? 0}</p>
              <p className="text-xs uppercase tracking-widest text-ink/40">checked in</p>
            </div>
          </Link>
        ))}
        {rows.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-ink/20 p-16 text-center text-ink/50">
            No sessions yet. Start one above.
          </div>
        ) : null}
      </div>
    </div>
  );
}
