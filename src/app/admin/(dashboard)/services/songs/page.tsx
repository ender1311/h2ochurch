import Link from "next/link";
import { createAdminClient } from "@/utils/supabase/admin";
import { createSong, deleteSong } from "@/lib/cms/actions/services";

export const dynamic = "force-dynamic";
export const metadata = { title: "Song Library — H2O Hub" };

type Song = {
  id: string;
  title: string;
  artist: string | null;
  ccli_number: string | null;
  default_key: string | null;
  bpm: number | null;
};

export default async function SongsPage() {
  const supabase = createAdminClient();
  const { data } = await supabase.from("songs").select("*").order("title");
  const songs = (data ?? []) as Song[];

  return (
    <div>
      <Link href="/admin/services" className="text-sm font-semibold text-ink/50 hover:text-brand">
        ← Back to services
      </Link>
      <h1 className="mt-6 font-display text-4xl font-extrabold text-ink">Song Library</h1>
      <p className="mt-1 text-ink/60">{songs.length} songs ready to drop into a service plan.</p>

      <form action={createSong} className="mt-8 grid gap-3 rounded-2xl border border-ink/10 bg-cream p-5 sm:grid-cols-5">
        <input name="title" required placeholder="Song title" className="rounded-xl border border-ink/15 bg-paper px-4 py-2.5 outline-none focus:border-brand sm:col-span-2" />
        <input name="artist" placeholder="Artist" className="rounded-xl border border-ink/15 bg-paper px-4 py-2.5 outline-none focus:border-brand" />
        <div className="flex gap-3">
          <input name="default_key" placeholder="Key" className="w-20 rounded-xl border border-ink/15 bg-paper px-4 py-2.5 outline-none focus:border-brand" />
          <input name="bpm" type="number" placeholder="BPM" className="w-24 rounded-xl border border-ink/15 bg-paper px-4 py-2.5 outline-none focus:border-brand" />
        </div>
        <div className="flex gap-3">
          <input name="ccli_number" placeholder="CCLI #" className="flex-1 rounded-xl border border-ink/15 bg-paper px-4 py-2.5 outline-none focus:border-brand" />
          <button className="rounded-full bg-brand px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-cream transition-colors hover:bg-water">
            Add
          </button>
        </div>
      </form>

      <div className="mt-6 overflow-hidden rounded-3xl border border-ink/10 bg-cream">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 bg-sand/50 text-xs font-bold uppercase tracking-widest text-ink/50">
            <tr>
              <th className="px-6 py-4">Title</th>
              <th className="hidden px-6 py-4 sm:table-cell">Artist</th>
              <th className="px-6 py-4">Key</th>
              <th className="hidden px-6 py-4 md:table-cell">BPM</th>
              <th className="hidden px-6 py-4 md:table-cell">CCLI</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/8">
            {songs.map((s) => {
              const remove = deleteSong.bind(null, s.id);
              return (
                <tr key={s.id} className="hover:bg-water/5">
                  <td className="px-6 py-4 font-semibold text-ink">{s.title}</td>
                  <td className="hidden px-6 py-4 text-ink/70 sm:table-cell">{s.artist ?? "—"}</td>
                  <td className="px-6 py-4 text-ink/70">{s.default_key ?? "—"}</td>
                  <td className="hidden px-6 py-4 text-ink/70 md:table-cell">{s.bpm ?? "—"}</td>
                  <td className="hidden px-6 py-4 text-ink/70 md:table-cell">{s.ccli_number ?? "—"}</td>
                  <td className="px-6 py-4 text-right">
                    <form action={remove}>
                      <button className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
            {songs.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-16 text-center text-ink/50">No songs yet.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
