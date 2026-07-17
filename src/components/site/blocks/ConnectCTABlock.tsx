import Link from "next/link";

export type ConnectCTABlockProps = {
  blurb: string;
  ctaLabel: string;
  ctaHref: string;
};

export function ConnectCTABlock({ blurb, ctaLabel, ctaHref }: ConnectCTABlockProps) {
  return (
    <section id="connect" className="scroll-mt-24 bg-brand py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-5 sm:px-8 md:flex-row">
        <div className="flex items-center gap-6">
          <span className="flex flex-col items-center leading-none">
            <span className="font-display text-3xl font-bold text-white">
              H<span className="text-[0.7em]">2</span>O
            </span>
            <span className="mt-1 text-[0.6rem] font-medium uppercase tracking-[0.5em] text-white/80">Church</span>
          </span>
          <p className="max-w-md text-white/90">
            {blurb}
          </p>
        </div>
        <Link
          href={ctaHref}
          className="shrink-0 border border-white px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-brand"
        >
          {ctaLabel}
        </Link>
      </div>
    </section>
  );
}
