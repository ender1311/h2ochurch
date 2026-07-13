import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/admin";
import { checkIn, undoCheckIn, deleteSession } from "@/lib/cms/actions/checkins";
import { DeleteButton } from "@/components/admin/DeleteButton";
import type { CheckinSession, Person } from "@/lib/cms/types";

export const dynamic = "force-dynamic";

type Roster = Pick<Person, "id" | "first_name" | "last_name">;

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: session } = await supabase.from("checkin_sessions").select("*").eq("id", id).single();
  if (!session) notFound();
  const s = session as CheckinSession;

  const { data: checkinRows } = await supabase.from("checkins").select("person_id").eq("session_id", id);
  const checkedIn = new Set((checkinRows ?? []).map((c) => (c as { person_id: string }).person_id));

  let roster: Roster[] = [];
  if (s.group_id) {
    const { data } = await supabase
      .from("group_memberships")
      .select("people(id,first_name,last_name)")
      .eq("group_id", s.group_id);
    roster = (data ?? []).map((m) => (m as unknown as { people: Roster }).people);
  } else {
    const { data } = await supabase.from("people").select("id,first_name,last_name").order("last_name");
    roster = (data ?? []) as Roster[];
  }
  roster.sort((a, b) => a.last_name.localeCompare(b.last_name));

  const remove = deleteSession.bind(null, id);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <Link href="/admin/checkins" className="text-sm font-semibold text-ink/50 hover:text-brand">
          ← Back to check-ins
        </Link>
        <div className="flex items-center gap-3">
          <a
            href={`/admin/checkins/${id}/export`}
            className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-bold uppercase tracking-widest text-ink transition-colors hover:border-brand hover:text-brand"
          >
            Export CSV
          </a>
          <DeleteButton action={remove} label="Delete session" confirm={`Delete session ${s.name}?`} />
        </div>
      </div>

      <div className="mt-6">
        <h1 className="font-display text-4xl font-extrabold text-ink">{s.name}</h1>
        <p className="mt-1 text-ink/60">
          {s.session_date} · {checkedIn.size} checked in of {roster.length}
        </p>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {roster.map((p) => {
          const isIn = checkedIn.has(p.id);
          const action = isIn ? undoCheckIn.bind(null, id, p.id) : checkIn.bind(null, id, p.id);
          return (
            <form key={p.id} action={action}>
              <button
                className={`flex w-full items-center justify-between rounded-2xl border px-5 py-4 text-left transition-colors ${
                  isIn
                    ? "border-brand bg-brand text-cream"
                    : "border-ink/10 bg-cream text-ink hover:border-brand"
                }`}
              >
                <span className="font-semibold">
                  {p.first_name} {p.last_name}
                </span>
                <span className={`flex h-7 w-7 items-center justify-center rounded-full ${isIn ? "bg-cream/20" : "bg-water/10"}`}>
                  {isIn ? (
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-brand" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                    </svg>
                  )}
                </span>
              </button>
            </form>
          );
        })}
        {roster.length === 0 ? (
          <p className="text-ink/50">No people to check in.</p>
        ) : null}
      </div>
    </div>
  );
}
