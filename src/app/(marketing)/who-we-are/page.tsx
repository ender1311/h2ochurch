import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { AboutNav } from "@/components/site/AboutNav";
import { Accordion, type AccordionItem } from "@/components/site/Accordion";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Who We Are — H2O Church",
  description:
    "H2O is a local church cultivating a Christlike community at Ohio State — a church of Tov (goodness) shaped by four core values.",
};

const VALUES: AccordionItem[] = [
  {
    emphasis: "Spiritual Formation",
    rest: "is our way",
    body: "We — having put our faith in Christ as the true Way — cultivate one another in apprenticeship to Jesus by walking with him in fervent prayer, study and meditation on scripture, spiritual disciplines, and obedience to his teachings.",
  },
  {
    emphasis: "Community",
    rest: "is our reality",
    body: "We share life together in fellowship, walking with one another in authenticity, kindness, grace, and holiness.",
  },
  {
    emphasis: "Humility",
    rest: "is our posture",
    body: "We aim to embody Christlikeness by living and serving with transparency, understanding, and the admission that we are all in need of grace from God and from one another.",
  },
  {
    emphasis: "Mission",
    rest: "is our call",
    body: "We partake in the growth of God's Kingdom by preaching the Gospel, by showing hospitality to our neighbors, by living justly, and by serving the felt needs of our campus, city, and world.",
  },
];

export default function WhoWeArePage() {
  return (
    <main>
      <PageHero
        eyebrow="About H2O"
        title="Who We Are"
        subtitle="A local church living life together on campus at Ohio State — following Jesus and inviting others to do the same."
      />
      <AboutNav />

      {/* Our Mission */}
      <section className="bg-paper py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-brand">Our Mission</p>
          </Reveal>
          <Reveal delay={120}>
            <p className="mx-auto mt-8 max-w-3xl text-balance font-display text-3xl font-semibold leading-[1.15] text-ink sm:text-5xl">
              Cultivating a Christlike community at OSU to grow His{" "}
              <span className="relative whitespace-nowrap text-brand">
                kingdom
                <svg viewBox="0 0 200 12" className="absolute -bottom-2 left-0 w-full text-water" preserveAspectRatio="none">
                  <path d="M2 8C50 2 150 2 198 8" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
                </svg>
              </span>{" "}
              wherever we go.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Our Core Values */}
      <section className="border-t border-ink/10 bg-sand py-24 sm:py-32">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.4fr] lg:items-start">
            <Reveal className="lg:sticky lg:top-32">
              <p className="text-xs font-bold uppercase tracking-[0.4em] text-brand">Our Core Values</p>
              <h2 className="mt-6 font-display text-4xl font-extrabold leading-tight text-ink sm:text-5xl">
                A church of{" "}
                <span className="text-brand">
                  Tov
                </span>
                <span className="ml-2 font-serif text-3xl font-normal italic text-ink/50">
                  (טוב)
                </span>
              </h2>
              <p className="mt-6 max-w-md leading-relaxed text-ink/70">
                We hold four primary values, each aimed to help us cultivate a Christlike community
                at OSU by being a church of <em className="font-serif not-italic text-ink">Tov</em>.
                Tov is the Hebrew word the Bible uses to describe &ldquo;Goodness&rdquo; — something
                that fully embodies the divine purpose for which God has designed it.
              </p>
            </Reveal>

            <Reveal delay={140}>
              <Accordion items={VALUES} />
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  );
}
