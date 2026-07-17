import Link from "next/link";

export type HeroBlockProps = {
  headline: string;
  subtext: string;
  ctaLabel: string;
  ctaHref: string;
  videoSrc: string;
  posterSrc: string;
};

export function HeroBlock({ headline, subtext, ctaLabel, ctaHref, videoSrc, posterSrc }: HeroBlockProps) {
  return (
    <section className="relative flex min-h-[70vh] items-center overflow-hidden bg-slate">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay muted loop playsInline preload="auto" poster={posterSrc} aria-hidden="true"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-r from-charcoal/85 via-charcoal/60 to-charcoal/30" />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-24 sm:px-8">
        <h1 className="animate-rise font-display text-5xl font-bold leading-none text-white sm:text-7xl" style={{ animationDelay: "0.1s" }}>
          {headline}
        </h1>
        <p className="animate-rise mt-5 max-w-xl text-lg font-medium uppercase tracking-[0.15em] text-white/85 sm:text-2xl" style={{ animationDelay: "0.25s" }}>
          {subtext}
        </p>
        <div className="animate-rise mt-9" style={{ animationDelay: "0.4s" }}>
          <Link href={ctaHref} className="inline-block bg-white px-9 py-4 text-sm font-bold uppercase tracking-widest text-slate transition-colors hover:bg-brand hover:text-white">
            {ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
