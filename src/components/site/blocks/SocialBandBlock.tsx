export type SocialBandBlockProps = {
  heading: string;
  ctaLabel: string;
  href: string;
};

export function SocialBandBlock({ heading, ctaLabel, href }: SocialBandBlockProps) {
  return (
    <section className="bg-sand py-20 text-center">
      <div className="mx-auto max-w-3xl px-5">
        <div className="flex items-center justify-center gap-4">
          <span className="h-px w-10 bg-brand" />
          <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-brand">{heading}</h2>
          <span className="h-px w-10 bg-brand" />
        </div>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-block bg-brand px-9 py-4 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-deep"
        >
          {ctaLabel}
        </a>
      </div>
    </section>
  );
}
