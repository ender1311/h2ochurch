import type { Metadata } from "next";
import { createAdminClient } from "@/utils/supabase/admin";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/Reveal";
import type { Sermon } from "@/lib/cms/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sermons — H2O Church",
  description: "Listen to past messages from H2O Church at Ohio State.",
};

function fmt(v: string | null) {
  if (!v) return null;
  return new Date(`${v}T00:00:00`).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function SermonsPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("sermons")
    .select("id,title,speaker,series,scripture,description,audio_url,preached_on,published")
    .eq("published", true)
    .order("preached_on", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  const sermons = (data ?? []) as Sermon[];

  return (
    <main>
      <PageHero
        eyebrow="H2O Church"
        title="Sermons"
        subtitle="Missed a Sunday, or want to revisit a message? Listen to past teachings from our community."
      />

      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          {sermons.length === 0 ? (
            <div className="rounded-lg border border-dashed border-ink/20 p-16 text-center text-ink/50">
              No sermons posted yet — check back soon!
            </div>
          ) : (
            <div className="grid gap-6">
              {sermons.map((s, i) => {
                const date = fmt(s.preached_on);
                return (
                  <Reveal
                    key={s.id}
                    as="article"
                    delay={(i % 3) * 100}
                    className="border border-black/5 bg-white p-7 shadow-[0_10px_40px_-15px_rgba(43,51,60,0.18)] sm:p-9"
                  >
                    {s.series ? (
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">{s.series}</p>
                    ) : null}
                    <h2 className="mt-1 font-display text-2xl font-bold text-slate">{s.title}</h2>
                    <p className="mt-1 text-sm text-ink/55">
                      {[s.speaker, s.scripture, date].filter(Boolean).join(" · ")}
                    </p>
                    {s.description ? (
                      <p className="mt-4 leading-relaxed text-ink/70">{s.description}</p>
                    ) : null}
                    {s.audio_url ? (
                      <audio controls preload="none" src={s.audio_url} className="mt-5 w-full">
                        Your browser does not support the audio element.
                      </audio>
                    ) : null}
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
