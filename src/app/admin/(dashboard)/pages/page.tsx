import Link from "next/link";
import { createAdminClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pages — H2O Hub" };

export default async function PagesList() {
  const supabase = createAdminClient();
  const { data } = await supabase.from("pages").select("slug,title,published_data,updated_at").order("slug");
  const pages = data ?? [];
  return (
    <div>
      <h1 className="font-display text-4xl font-extrabold text-ink">Pages</h1>
      <p className="mt-1 text-ink/60">Edit the public website with drag &amp; drop.</p>
      <div className="mt-8 grid gap-4">
        {pages.map((p) => (
          <div key={p.slug}
            className="relative flex items-center justify-between rounded-3xl border border-ink/10 bg-cream p-6 hover:border-water/30">
            <Link href={`/admin/pages/${p.slug}/edit`} className="absolute inset-0 rounded-3xl" aria-label={`Edit ${p.title}`} />
            <div>
              <h2 className="font-display text-xl font-bold text-ink">{p.title}</h2>
              <p className="mt-1 text-sm text-ink/55">/{p.slug === "home" ? "" : p.slug}</p>
            </div>
            <div className="relative z-10 flex items-center gap-3">
              <a href={`/admin/pages/${p.slug}/preview`} target="_blank" rel="noopener noreferrer"
                className="rounded-full border border-ink/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-ink/60 hover:border-water/40 hover:text-brand">
                Preview
              </a>
              <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${p.published_data ? "bg-water/10 text-brand" : "bg-ink/5 text-ink/40"}`}>
                {p.published_data ? "Published" : "Draft"}
              </span>
            </div>
          </div>
        ))}
        {pages.length === 0 ? <div className="rounded-3xl border border-dashed border-ink/20 p-16 text-center text-ink/50">No editable pages yet. Run the seed script.</div> : null}
      </div>
    </div>
  );
}
