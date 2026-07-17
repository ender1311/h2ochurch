import Link from "next/link";
import { Reveal } from "@/components/Reveal";

type CardIcon = "community" | "mission" | "sundays";

const ICONS: Record<CardIcon, React.ReactNode> = {
  community: (
    <>
      <circle cx="8" cy="9" r="3" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 20c0-3 2.2-5 5-5s5 2 5 5M14 20c0-2.2 1.4-3.8 3.4-3.8S21 17.8 21 20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  mission: (
    <path d="M4 12l16-8-6 16-3.5-6.5L4 12z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="none" />
  ),
  sundays: (
    <>
      <path d="M12 3v18M7 8l5-5 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 21h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
};

export type FeatureCard = {
  id: string;
  title: string;
  body: string;
  href: string;
  icon: CardIcon;
};

export type FeatureCardsBlockProps = {
  cards: FeatureCard[];
};

export function FeatureCardsBlock({ cards }: FeatureCardsBlockProps) {
  return (
    <section id="community" className="scroll-mt-24 bg-white py-20 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 sm:px-8 md:grid-cols-3">
        {cards.map((f, i) => (
          <Reveal
            key={f.id}
            as="article"
            delay={i * 120}
            className="flex flex-col items-center border border-black/5 bg-white p-9 text-center shadow-[0_10px_40px_-15px_rgba(43,51,60,0.18)]"
          >
            <span className="text-brand">
              <svg viewBox="0 0 24 24" fill="none" className="h-12 w-12">
                {ICONS[f.icon]}
              </svg>
            </span>
            <h3 className="mt-5 font-display text-xl font-bold uppercase tracking-wide text-slate">{f.title}</h3>
            <p className="mt-4 flex-1 text-sm leading-relaxed text-ink/70">{f.body}</p>
            <Link
              href={f.href}
              className="mt-7 bg-brand px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-deep"
            >
              Learn More
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
