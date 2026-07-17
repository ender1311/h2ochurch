"use client";

import { PageHero } from "@/components/site/PageHero";
import { AboutNav } from "@/components/site/AboutNav";

export type WhoWeAreHeroBlockProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
};

export function WhoWeAreHeroBlock({ eyebrow, title, subtitle }: WhoWeAreHeroBlockProps) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} subtitle={subtitle} />
      <AboutNav />
    </>
  );
}
