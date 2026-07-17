import { Reveal } from "@/components/Reveal";

export type BeliefItem = {
  n: string;
  title: string;
  ref: string;
  body: string;
};

export type BeliefsGridBlockProps = {
  beliefs: BeliefItem[];
};

export function BeliefsGridBlock({ beliefs }: BeliefsGridBlockProps) {
  return (
    <section className="bg-paper py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-5 md:grid-cols-2">
          {beliefs.map((b, i) => (
            <Reveal
              key={b.n}
              as="article"
              delay={(i % 2) * 90}
              className="group relative overflow-hidden rounded-3xl border border-ink/10 bg-cream p-8 transition-all duration-500 hover:-translate-y-1 hover:border-water/30 hover:shadow-[0_30px_70px_-40px_rgba(11,58,82,0.4)] sm:p-10"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="font-display text-2xl font-bold text-ink">{b.title}</h2>
                <span className="font-display text-3xl font-extrabold text-water/15 transition-colors duration-500 group-hover:text-water/30">
                  {b.n}
                </span>
              </div>
              <p className="mt-4 leading-relaxed text-ink/70">{b.body}</p>
              <p className="mt-5 font-serif text-sm italic text-brand">{b.ref}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
