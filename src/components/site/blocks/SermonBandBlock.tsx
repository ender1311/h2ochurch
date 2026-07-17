import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";

export type SermonBandBlockProps = {
  heading: string;
  blurb: string;
  ctaLabel: string;
  ctaHref: string;
  seriesLabel: string;
  seriesTitle: string;
  seriesBody: string;
};

export function SermonBandBlock({ heading, blurb, ctaLabel, ctaHref, seriesLabel, seriesTitle, seriesBody }: SermonBandBlockProps) {
  return (
    <section id="sundays" className="relative scroll-mt-24 overflow-hidden py-20 sm:py-28">
      <Image src="/images/worship-night.webp" alt="" fill sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-brand/90" />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-2">
        <Reveal>
          <div className="flex items-center gap-4">
            <span className="h-px w-10 bg-white/60" />
            <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-white">{heading}</h2>
          </div>
          <p className="mt-6 max-w-md text-white/85">
            {blurb}
          </p>
          <Link
            href={ctaHref}
            className="mt-8 inline-flex items-center gap-3 border border-white/60 px-7 py-3.5 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-brand"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-current">
              <svg viewBox="0 0 12 12" className="h-3 w-3 translate-x-px" fill="currentColor">
                <path d="M2 1l8 5-8 5z" />
              </svg>
            </span>
            {ctaLabel}
          </Link>
        </Reveal>

        <Reveal delay={150}>
          <div className="flex items-center gap-4">
            <span className="h-px w-10 bg-white/60" />
            <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-white">{seriesLabel}</h2>
          </div>
          <h3 className="mt-5 font-display text-2xl font-bold uppercase text-white">{seriesTitle}</h3>
          {seriesBody.split("\n\n").map((paragraph, idx) => (
            <p key={idx} className="mt-4 text-sm leading-relaxed text-white/80">
              {paragraph}
            </p>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
