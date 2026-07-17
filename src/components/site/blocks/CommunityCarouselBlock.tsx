import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { Carousel } from "@/components/site/Carousel";
import { COMMUNITY_PHOTOS } from "@/lib/photos";

export type CommunityCarouselBlockProps = {
  eyebrow: string;
  heading: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
};

export function CommunityCarouselBlock({ eyebrow, heading, body, ctaLabel, ctaHref }: CommunityCarouselBlockProps) {
  return (
    <section id="different" className="scroll-mt-24 bg-white py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2">
        <div>
          <Reveal>
            <div className="flex items-center gap-4">
              <span className="h-px w-10 bg-brand" />
              <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-brand">{eyebrow}</h2>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h3 className="mt-6 font-display text-4xl font-bold leading-tight text-slate sm:text-5xl">
              {heading}
            </h3>
          </Reveal>
          <Reveal delay={180}>
            <p className="mt-6 max-w-lg leading-relaxed text-ink/70">
              {body}
            </p>
          </Reveal>
          <Reveal delay={260}>
            <Link
              href={ctaHref}
              className="mt-8 inline-block bg-brand px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-deep"
            >
              {ctaLabel}
            </Link>
          </Reveal>
        </div>

        <Reveal delay={200}>
          <Carousel images={COMMUNITY_PHOTOS} />
        </Reveal>
      </div>
    </section>
  );
}
