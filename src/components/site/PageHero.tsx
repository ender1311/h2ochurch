import { Droplet } from "./Logo";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
};

export function PageHero({ eyebrow, title, subtitle }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-ink pt-36 pb-24 sm:pt-44 sm:pb-28">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(110% 90% at 80% 0%, #1e9bd7 0%, #0e6ba0 32%, #0b3a52 62%, #06212e 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-40 mix-blend-screen"
        style={{
          background:
            "radial-gradient(50% 60% at 15% 10%, rgba(88,207,228,0.45), transparent 60%)",
        }}
      />
      <div
        className="absolute -right-10 top-20 opacity-25"
        style={{ animation: "float-slow 8s ease-in-out infinite" }}
      >
        <Droplet tone="light" className="h-56 w-56" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <p className="animate-rise flex items-center gap-3 text-xs font-bold uppercase tracking-[0.4em] text-aqua">
          <span className="h-px w-10 bg-aqua/60" />
          {eyebrow}
        </p>
        <h1
          className="animate-rise mt-6 max-w-3xl font-display text-5xl font-extrabold leading-[0.95] tracking-tight text-cream sm:text-7xl"
          style={{ animationDelay: "0.12s" }}
        >
          {title}
        </h1>
        {subtitle ? (
          <p
            className="animate-rise mt-7 max-w-2xl text-lg leading-relaxed text-foam/80 sm:text-xl"
            style={{ animationDelay: "0.24s" }}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
    </section>
  );
}
