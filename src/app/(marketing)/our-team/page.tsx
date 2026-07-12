import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { AboutNav } from "@/components/site/AboutNav";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Our Team — H2O Church",
  description: "Meet the team that helps H2O Church live life together in community at Ohio State.",
};

type Member = { name: string; role: string; since: number };

const TEAM: Member[] = [
  { name: "Kathy Borsos", role: "Executive Director", since: 2009 },
  { name: "Mike Malone", role: "Church Life Director", since: 2000 },
  { name: "Jeremy Borsos", role: "Staff", since: 2009 },
  { name: "Will Houghton", role: "Worship Lead Intern", since: 2025 },
  { name: "Aziz Nahhas", role: "Staff Support", since: 1991 },
  { name: "Diane Gress", role: "Staff Support", since: 2016 },
  { name: "Maggie Luk", role: "Staff Support", since: 2014 },
  { name: "Vivake Baranwal", role: "Staff Support", since: 2012 },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
}

export default function OurTeamPage() {
  return (
    <main>
      <PageHero
        eyebrow="About H2O"
        title="Our Team"
        subtitle="As a local church, we live life together in community. Meet the people who help make that happen."
      />
      <AboutNav />

      <section className="bg-paper py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map((m, i) => (
              <Reveal
                key={m.name}
                as="article"
                delay={(i % 4) * 80}
                className="group flex flex-col items-center rounded-3xl border border-ink/10 bg-cream p-8 text-center transition-all duration-500 hover:-translate-y-1 hover:border-water/30 hover:shadow-[0_30px_70px_-40px_rgba(11,58,82,0.4)]"
              >
                <span
                  className="flex h-20 w-20 items-center justify-center rounded-full font-display text-2xl font-extrabold text-cream shadow-lg transition-transform duration-500 group-hover:scale-105"
                  style={{
                    background: "linear-gradient(150deg, #1e9bd7 0%, #0e6ba0 55%, #0b3a52 100%)",
                  }}
                  aria-hidden="true"
                >
                  {initials(m.name)}
                </span>
                <h2 className="mt-6 font-display text-xl font-bold text-ink">{m.name}</h2>
                <p className="mt-1 text-sm font-semibold uppercase tracking-widest text-brand">
                  {m.role}
                </p>
                <p className="mt-3 text-xs font-medium uppercase tracking-wider text-ink/40">
                  On staff since {m.since}
                </p>
              </Reveal>
            ))}
          </div>

          {/* Contact */}
          <Reveal>
            <div className="mt-14 flex flex-col items-center justify-between gap-6 rounded-3xl bg-ink px-8 py-10 text-center sm:flex-row sm:text-left">
              <div>
                <h2 className="font-display text-2xl font-bold text-cream">Reach the pastoral team</h2>
                <p className="mt-2 text-foam/70">
                  We&apos;d love to hear from you — questions, prayer, or just to say hi.
                </p>
              </div>
              <a
                href="mailto:pastors@h2osu.org"
                className="inline-flex items-center gap-3 rounded-full bg-cream px-8 py-4 text-sm font-bold uppercase tracking-widest text-ink transition-colors hover:bg-aqua"
              >
                pastors@h2osu.org
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
