import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/admin";
import { PrintButton } from "./PrintButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Print labels — H2O Hub" };

type CheckinRow = {
  checked_in_at: string;
  people: { first_name: string; last_name: string } | null;
};

export default async function LabelsPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const supabase = createAdminClient();
  const { data: session } = await supabase
    .from("checkin_sessions")
    .select("name, session_date")
    .eq("id", sessionId)
    .single();
  if (!session) notFound();

  const { data } = await supabase
    .from("checkins")
    .select("checked_in_at, people(first_name, last_name)")
    .eq("session_id", sessionId)
    .order("checked_in_at");
  const rows = ((data ?? []) as unknown as CheckinRow[]).filter((r) => r.people);

  const dateLabel = new Date(`${session.session_date}T12:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <main className="min-h-screen bg-white p-8 print:p-0">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <Link href={`/admin/checkins/${sessionId}`} className="text-sm font-semibold text-ink/50 hover:text-brand">
            ← Back to session
          </Link>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-ink">
            Name tags — {session.name}
          </h1>
          <p className="text-ink/60">
            {rows.length} labels · {dateLabel} · standard 2-column sheet
          </p>
        </div>
        <PrintButton />
      </div>

      <div className="grid grid-cols-2 gap-4 print:gap-[0.125in]">
        {rows.map((r, i) => (
          <div
            key={i}
            className="flex h-44 flex-col justify-between overflow-hidden rounded-xl border-2 border-slate print:h-[2.33in] print:break-inside-avoid print:rounded-none"
          >
            <div className="bg-slate px-5 py-2">
              <span className="font-display text-lg font-bold text-white">
                H<span className="text-[0.7em]">2</span>O
              </span>
              <span className="ml-2 text-[0.55rem] font-medium uppercase tracking-[0.4em] text-white/70">
                Church
              </span>
            </div>
            <div className="px-5">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand">Hello, my name is</p>
              <p className="mt-1 truncate font-display text-3xl font-extrabold leading-tight text-ink">
                {r.people!.first_name}
              </p>
              <p className="truncate font-display text-xl font-semibold text-ink/70">
                {r.people!.last_name}
              </p>
            </div>
            <div className="px-5 pb-3 text-[0.6rem] font-semibold uppercase tracking-widest text-ink/40">
              {session.name} · {dateLabel}
            </div>
          </div>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="mt-16 text-center text-ink/50">
          Nobody is checked in yet — check people in first, then print.
        </p>
      ) : null}
    </main>
  );
}
