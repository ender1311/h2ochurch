import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/admin";
import {
  addPlanItem,
  movePlanItem,
  removePlanItem,
  addAssignment,
  setAssignmentStatus,
  removeAssignment,
  deletePlan,
} from "@/lib/cms/actions/services";
import { DeleteButton } from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

type Item = {
  id: string;
  position: number;
  kind: string;
  title: string | null;
  song_key: string | null;
  length_minutes: number | null;
  notes: string | null;
};
type Assignment = {
  id: string;
  role: string;
  status: string;
  people: { id: string; first_name: string; last_name: string } | null;
  teams: { name: string } | null;
};

export default async function PlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: plan } = await supabase.from("service_plans").select("*").eq("id", id).single();
  if (!plan) notFound();

  const [{ data: itemRows }, { data: assignRows }, { data: songs }, { data: people }, { data: teams }] =
    await Promise.all([
      supabase.from("plan_items").select("*").eq("plan_id", id).order("position"),
      supabase.from("plan_assignments").select("id, role, status, people(id, first_name, last_name), teams(name)").eq("plan_id", id),
      supabase.from("songs").select("id, title, default_key").order("title"),
      supabase.from("people").select("id, first_name, last_name").order("last_name"),
      supabase.from("teams").select("id, name").order("name"),
    ]);

  const items = (itemRows ?? []) as Item[];
  const assignments = (assignRows ?? []) as unknown as Assignment[];
  const totalMinutes = items.reduce((s, i) => s + (i.length_minutes ?? 0), 0);
  const addItem = addPlanItem.bind(null, id);
  const assign = addAssignment.bind(null, id);
  const removePlanBound = deletePlan.bind(null, id);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <Link href="/admin/services" className="text-sm font-semibold text-ink/50 hover:text-brand">
          ← Back to services
        </Link>
        <DeleteButton action={removePlanBound} label="Delete plan" confirm={`Delete ${plan.title}?`} />
      </div>

      <div className="mt-6">
        <h1 className="font-display text-4xl font-extrabold text-ink">{plan.title}</h1>
        <p className="mt-1 text-ink/60">
          {new Date(`${plan.service_date}T12:00:00`).toLocaleDateString(undefined, {
            weekday: "long", month: "long", day: "numeric", year: "numeric",
          })}
          {totalMinutes ? ` · ${totalMinutes} min planned` : ""}
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        {/* Run sheet */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-ink/50">Order of service</h2>
          <div className="mt-3 overflow-hidden rounded-3xl border border-ink/10 bg-cream">
            {items.map((item, idx) => {
              const up = movePlanItem.bind(null, id, item.id, "up");
              const down = movePlanItem.bind(null, id, item.id, "down");
              const remove = removePlanItem.bind(null, id, item.id);
              return (
                <div key={item.id} className={`flex items-center gap-4 px-6 py-4 ${idx ? "border-t border-ink/8" : ""}`}>
                  <span className="w-6 text-right font-display text-sm font-extrabold text-water/70">{idx + 1}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-ink">
                      {item.title ?? item.kind}
                      {item.song_key ? <span className="ml-2 rounded bg-water/10 px-2 py-0.5 text-xs font-bold text-brand">{item.song_key}</span> : null}
                    </p>
                    <p className="text-xs uppercase tracking-wider text-ink/40">
                      {item.kind}{item.length_minutes ? ` · ${item.length_minutes} min` : ""}
                    </p>
                    {item.notes ? <p className="mt-0.5 text-sm text-ink/60">{item.notes}</p> : null}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <form action={up}><button aria-label="Move up" className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/15 text-ink/60 hover:border-brand hover:text-brand">↑</button></form>
                    <form action={down}><button aria-label="Move down" className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/15 text-ink/60 hover:border-brand hover:text-brand">↓</button></form>
                    <form action={remove}><button aria-label="Remove" className="flex h-8 w-8 items-center justify-center rounded-full border border-red-200 text-red-500 hover:bg-red-50">✕</button></form>
                  </div>
                </div>
              );
            })}
            {items.length === 0 ? <p className="px-6 py-12 text-center text-ink/50">Empty run sheet — add the first item below.</p> : null}
          </div>

          <form action={addItem} className="mt-4 grid gap-3 rounded-2xl border border-ink/10 bg-cream p-5 sm:grid-cols-2">
            <select name="kind" className="rounded-xl border border-ink/15 bg-paper px-4 py-2.5 outline-none focus:border-brand">
              <option value="song">Song</option>
              <option value="header">Header / Section</option>
              <option value="prayer">Prayer</option>
              <option value="sermon">Sermon</option>
              <option value="other">Other</option>
            </select>
            <select name="song_id" className="rounded-xl border border-ink/15 bg-paper px-4 py-2.5 outline-none focus:border-brand">
              <option value="">— From song library —</option>
              {(songs ?? []).map((s) => (
                <option key={s.id} value={s.id}>{s.title}{s.default_key ? ` (${s.default_key})` : ""}</option>
              ))}
            </select>
            <input name="title" placeholder="Custom title (optional if song chosen)" className="rounded-xl border border-ink/15 bg-paper px-4 py-2.5 outline-none focus:border-brand" />
            <div className="flex gap-3">
              <input name="length_minutes" type="number" placeholder="Min" className="w-24 rounded-xl border border-ink/15 bg-paper px-4 py-2.5 outline-none focus:border-brand" />
              <input name="notes" placeholder="Notes" className="flex-1 rounded-xl border border-ink/15 bg-paper px-4 py-2.5 outline-none focus:border-brand" />
            </div>
            <button className="rounded-full bg-brand px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-cream transition-colors hover:bg-water sm:col-span-2">
              Add to run sheet
            </button>
          </form>
        </div>

        {/* Scheduling */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-ink/50">Team scheduling</h2>
          <div className="mt-3 grid gap-2">
            {assignments.map((a) => {
              const confirm = setAssignmentStatus.bind(null, id, a.id, "confirmed");
              const decline = setAssignmentStatus.bind(null, id, a.id, "declined");
              const remove = removeAssignment.bind(null, id, a.id);
              return (
                <div key={a.id} className="rounded-2xl border border-ink/10 bg-cream px-5 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">
                        {a.people ? `${a.people.first_name} ${a.people.last_name}` : "Unknown"}
                      </p>
                      <p className="text-xs uppercase tracking-wider text-ink/40">
                        {[a.role, a.teams?.name].filter(Boolean).join(" · ") || "No role"}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                      a.status === "confirmed" ? "bg-brand text-cream" : a.status === "declined" ? "bg-red-100 text-red-600" : "bg-ink/5 text-ink/50"
                    }`}>
                      {a.status}
                    </span>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <form action={confirm}><button className="rounded-full border border-ink/15 px-3 py-1 text-xs font-semibold text-ink/60 hover:border-brand hover:text-brand">Confirm</button></form>
                    <form action={decline}><button className="rounded-full border border-ink/15 px-3 py-1 text-xs font-semibold text-ink/60 hover:border-red-300 hover:text-red-600">Decline</button></form>
                    <form action={remove}><button className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-500 hover:bg-red-50">Remove</button></form>
                  </div>
                </div>
              );
            })}
            {assignments.length === 0 ? <p className="text-sm text-ink/50">Nobody scheduled yet.</p> : null}
          </div>

          <form action={assign} className="mt-4 grid gap-3 rounded-2xl border border-ink/10 bg-cream p-5">
            <select name="person_id" required className="rounded-xl border border-ink/15 bg-paper px-4 py-2.5 outline-none focus:border-brand">
              <option value="">Choose a person…</option>
              {(people ?? []).map((p) => (
                <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
              ))}
            </select>
            <div className="flex gap-3">
              <input name="role" placeholder="Role (e.g. Vocals, Sound)" className="flex-1 rounded-xl border border-ink/15 bg-paper px-4 py-2.5 outline-none focus:border-brand" />
              <select name="team_id" className="rounded-xl border border-ink/15 bg-paper px-4 py-2.5 outline-none focus:border-brand">
                <option value="">No team</option>
                {(teams ?? []).map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <button className="rounded-full bg-brand px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-cream transition-colors hover:bg-water">
              Schedule person
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
