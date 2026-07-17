import { PageHero } from "@/components/site/PageHero";
import { AboutNav } from "@/components/site/AboutNav";

export type OurTeamHeroBlockProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
};

export function OurTeamHeroBlock({ eyebrow, title, subtitle }: OurTeamHeroBlockProps) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} subtitle={subtitle} />
      <AboutNav />
    </>
  );
}
