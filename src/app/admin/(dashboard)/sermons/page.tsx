import Link from "next/link";
import { createAdminClient } from "@/utils/supabase/admin";
import { setSermonPublished, deleteSermon } from "@/lib/cms/actions/sermons";
import type { Sermon } from "@/lib/cms/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sermons — H2O Hub" };

function fmtDate(v: string | null) {
  if (!v) return "No date";
  return new Date(`${v}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function SermonsPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("sermons")
    .select("*")
    .order("preached_on", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  const sermons = (data ?? []) as Sermon[];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-extrabold text-ink">Sermons</h1>
          <p className="mt-1 text-ink/60">Upload audio and publish messages to the website.</p>
        </div>
        <Link
          href="/admin/sermons/new"
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold uppercase tracking-widest text-cream transition-colors hover:bg-water"
        >
          + New sermon
        </Link>
      </div>

      <div className="mt-8 grid gap-4">
        {sermons.map((s) => (
          <div
            key={s.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-ink/10 bg-cream p-6"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <h2 className="font-display text-xl font-bold text-ink">{s.title}</h2>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                    s.published ? "bg-water/10 text-brand" : "bg-ink/5 text-ink/40"
                  }`}
                >
                  {s.published ? "Published" : "Draft"}
                </span>
              </div>
              <p className="mt-1 text-sm text-ink/55">
                {[s.speaker, s.series, fmtDate(s.preached_on)].filter(Boolean).join(" · ")}
              </p>
              {s.audio_url ? (
                <audio controls preload="none" src={s.audio_url} className="mt-3 w-full max-w-md" />
              ) : (
                <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-amber-600">
                  No audio attached
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <form action={setSermonPublished.bind(null, s.id, !s.published)}>
                <button
                  type="submit"
                  className="rounded-full border border-ink/15 px-4 py-2 text-xs font-bold uppercase tracking-widest text-ink/70 transition-colors hover:border-brand hover:text-brand"
                >
                  {s.published ? "Unpublish" : "Publish"}
                </button>
              </form>
              <form action={deleteSermon.bind(null, s.id)}>
                <button
                  type="submit"
                  className="rounded-full border border-red-300 px-4 py-2 text-xs font-bold uppercase tracking-widest text-red-500 transition-colors hover:bg-red-50"
                >
                  Delete
                </button>
              </form>
            </div>
          </div>
        ))}
        {sermons.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-ink/20 p-16 text-center text-ink/50">
            No sermons yet. Add your first one.
          </div>
        ) : null}
      </div>
    </div>
  );
}
