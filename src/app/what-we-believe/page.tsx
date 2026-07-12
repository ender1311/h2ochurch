import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { AboutNav } from "@/components/site/AboutNav";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "What We Believe — H2O Church",
  description:
    "The core convictions that shape H2O Church — Scripture, the Triune God, Jesus, the Spirit, salvation by grace, and the mission of the Church.",
};

const BELIEFS: { n: string; title: string; ref: string; body: string }[] = [
  {
    n: "01",
    title: "The Scriptures",
    ref: "2 Timothy 3:16–17",
    body: "We believe the Bible is God's inspired, trustworthy Word — the final authority for what we believe and how we live.",
  },
  {
    n: "02",
    title: "One God, Three Persons",
    ref: "Matthew 28:19",
    body: "We believe in one God, eternally existing in three persons: Father, Son, and Holy Spirit — perfect in love, holiness, and power.",
  },
  {
    n: "03",
    title: "Jesus Christ",
    ref: "John 1:14; 1 Corinthians 15",
    body: "We believe Jesus is fully God and fully man, who lived a sinless life, died in our place, rose bodily from the grave, and reigns today.",
  },
  {
    n: "04",
    title: "The Holy Spirit",
    ref: "Acts 1:8",
    body: "We believe the Spirit indwells every follower of Jesus, forming us into Christ's likeness and empowering us for life and mission.",
  },
  {
    n: "05",
    title: "Salvation by Grace",
    ref: "Ephesians 2:8–9",
    body: "We believe salvation is a gift of grace received through faith in Jesus alone — not earned by works, but the free response to mercy already given.",
  },
  {
    n: "06",
    title: "The Church",
    ref: "Acts 2:42–47",
    body: "We believe the Church is God's family — a community that gathers to worship, grows together in discipleship, and is sent to love the world.",
  },
  {
    n: "07",
    title: "The Mission",
    ref: "Matthew 28:18–20",
    body: "We believe every follower of Jesus is called to make disciples — starting on our campus and reaching to all nations.",
  },
  {
    n: "08",
    title: "The Hope to Come",
    ref: "Revelation 21",
    body: "We believe Jesus will return to make all things new, and that we live today in the sure hope of His coming kingdom.",
  },
];

export default function WhatWeBelievePage() {
  return (
    <main>
      <PageHero
        eyebrow="About H2O"
        title="What We Believe"
        subtitle="We're an orthodox Christian church. These are the core convictions that anchor everything we do."
      />
      <AboutNav />

      <section className="bg-paper py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid gap-5 md:grid-cols-2">
            {BELIEFS.map((b, i) => (
              <Reveal
                key={b.n}
                as="article"
                delay={(i % 2) * 90}
                className="group relative overflow-hidden rounded-3xl border border-ink/10 bg-cream p-8 transition-all duration-500 hover:-translate-y-1 hover:border-water/30 hover:shadow-[0_30px_70px_-40px_rgba(11,58,82,0.4)] sm:p-10"
              >
                <div className="flex items-start justify-between gap-4">
                  <h2 className="font-display text-2xl font-bold text-ink">{b.title}</h2>
                  <span className="font-display text-3xl font-extrabold text-water/15 transition-colors duration-500 group-hover:text-water/30">
                    {b.n}
                  </span>
                </div>
                <p className="mt-4 leading-relaxed text-ink/70">{b.body}</p>
                <p className="mt-5 font-serif text-sm italic text-brand">{b.ref}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
