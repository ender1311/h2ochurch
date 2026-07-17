import { PageHero } from "@/components/site/PageHero";
import { AboutNav } from "@/components/site/AboutNav";

export type WhatWeBelieveHeroBlockProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
};

export function WhatWeBelieveHeroBlock({ eyebrow, title, subtitle }: WhatWeBelieveHeroBlockProps) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} subtitle={subtitle} />
      <AboutNav />
    </>
  );
}
