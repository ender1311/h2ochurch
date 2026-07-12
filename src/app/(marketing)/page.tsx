import { Droplet } from "@/components/site/Logo";
import { Reveal } from "@/components/Reveal";

export default function Home() {
  return (
    <main id="top">
      <Hero />
      <FeatureCards />
      <Mission />
      <CurrentSeries />
      <Different />
      <ConnectCTA />
    </main>
  );
}

/* ── Hero ───────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-ink">
      {/* Layered ocean gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 78% 8%, #1e9bd7 0%, #0e6ba0 26%, #0b3a52 52%, #06212e 82%)",
        }}
      />
      {/* Caustic light streaks */}
      <div
        className="absolute inset-0 opacity-40 mix-blend-screen"
        style={{
          background:
            "radial-gradient(60% 40% at 20% 0%, rgba(88,207,228,0.5), transparent 60%), radial-gradient(50% 50% at 90% 20%, rgba(30,155,215,0.4), transparent 60%)",
        }}
      />

      {/* Floating droplet */}
      <div
        className="absolute right-[8%] top-[22%] hidden lg:block"
        style={{ animation: "float-slow 7s ease-in-out infinite" }}
      >
        <Droplet tone="light" className="h-40 w-40 opacity-90 drop-shadow-2xl" />
        <span className="absolute -inset-6 -z-10 rounded-full bg-aqua/20 blur-2xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pt-32 pb-40 sm:px-8">
        <p
          className="animate-rise flex items-center gap-3 text-xs font-bold uppercase tracking-[0.4em] text-aqua"
          style={{ animationDelay: "0.1s" }}
        >
          <span className="h-px w-10 bg-aqua/60" />
          A Campus Church at Ohio State · Since 2008
        </p>

        <h1
          className="animate-rise mt-7 max-w-4xl font-display text-6xl font-extrabold leading-[0.95] tracking-tight text-cream sm:text-7xl lg:text-8xl"
          style={{ animationDelay: "0.22s" }}
        >
          Welcome
          <br />
          to <span className="text-aqua">H2O</span>.
        </h1>

        <p
          className="animate-rise mt-8 max-w-xl text-lg leading-relaxed text-foam/85 sm:text-xl"
          style={{ animationDelay: "0.36s" }}
        >
          We&apos;re a local church living life together in community on campus — cultivating a
          Christlike family at Ohio State to grow His kingdom wherever we go.
        </p>

        <div
          className="animate-rise mt-11 flex flex-col gap-4 sm:flex-row sm:items-center"
          style={{ animationDelay: "0.5s" }}
        >
          <a
            href="#connect"
            className="group inline-flex items-center justify-center gap-3 rounded-full bg-cream px-9 py-4 text-sm font-bold uppercase tracking-widest text-ink transition-all duration-300 hover:bg-aqua hover:shadow-[0_20px_50px_-20px_rgba(88,207,228,0.9)]"
          >
            Get Connected
            <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1">
              <path d="M4 10h11m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a
            href="#sundays"
            className="inline-flex items-center justify-center gap-3 rounded-full border border-white/25 px-9 py-4 text-sm font-bold uppercase tracking-widest text-cream transition-all duration-300 hover:border-aqua hover:bg-white/5"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-aqua/20">
              <svg viewBox="0 0 12 12" className="h-3 w-3 translate-x-[1px] text-aqua" fill="currentColor">
                <path d="M2 1l8 5-8 5z" />
              </svg>
            </span>
            Watch a Message
          </a>
        </div>

        {/* Sunday info chip */}
        <div
          className="animate-rise mt-16 inline-flex flex-wrap items-center gap-x-8 gap-y-3 rounded-2xl border border-white/10 bg-white/5 px-7 py-4 backdrop-blur-md"
          style={{ animationDelay: "0.64s" }}
        >
          <span className="flex items-center gap-2 text-sm text-foam/80">
            <span className="h-2 w-2 animate-pulse rounded-full bg-aqua" />
            Sundays · Worship Gatherings
          </span>
          <span className="hidden h-4 w-px bg-white/15 sm:block" />
          <span className="text-sm text-foam/80">1385 Neil Ave, Columbus</span>
        </div>
      </div>

      {/* Animated wave base */}
      <WaveStack />
      <ScrollCue />
    </section>
  );
}

function WaveStack() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
      <svg viewBox="0 0 1440 220" preserveAspectRatio="none" className="h-[16vw] min-h-[110px] w-full">
        <path
          fill="#f4efe4"
          fillOpacity="0.18"
          d="M0,120 C240,190 480,60 720,110 C960,160 1200,70 1440,120 L1440,220 L0,220 Z"
        />
        <path
          fill="#f4efe4"
          fillOpacity="0.5"
          d="M0,150 C240,210 480,110 720,150 C960,190 1200,120 1440,160 L1440,220 L0,220 Z"
        />
        <path
          fill="#f4efe4"
          d="M0,185 C240,220 520,160 720,185 C960,214 1200,165 1440,190 L1440,220 L0,220 Z"
        />
      </svg>
    </div>
  );
}

function ScrollCue() {
  return (
    <div className="absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-2 text-foam/50 sm:flex">
      <span className="text-[0.6rem] font-semibold uppercase tracking-[0.35em]">Scroll</span>
      <span className="flex h-9 w-5 justify-center rounded-full border border-foam/30 pt-1.5">
        <span className="h-2 w-1 rounded-full bg-aqua" style={{ animation: "float-slow 1.6s ease-in-out infinite" }} />
      </span>
    </div>
  );
}

/* ── Feature cards ──────────────────────────────────────────────────── */
const FEATURES = [
  {
    n: "01",
    id: "community",
    title: "Our Community",
    body: "As a church body, we live life together. Bible studies and community groups meet through the week across every corner of campus.",
    cta: "Find a Group",
    icon: (
      <>
        <circle cx="8" cy="9" r="3" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="17" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3 20c0-3 2.2-5 5-5s5 2 5 5M14 20c0-2.2 1.4-3.8 3.4-3.8S21 17.8 21 20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </>
    ),
  },
  {
    n: "02",
    id: "mission",
    title: "Our Mission",
    body: "We're a local church committed to cultivating a Christlike community at OSU — to grow His kingdom wherever we go.",
    cta: "What We Believe",
    icon: <path d="M4 12l16-8-6 16-3.5-6.5L4 12z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="none" />,
  },
  {
    n: "03",
    id: "sundays",
    title: "Sundays",
    body: "We gather Sunday mornings to worship together, sit under the Word, and connect as one church family.",
    cta: "Plan a Visit",
    icon: (
      <>
        <path d="M12 3v18M7 8l5-5 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 21h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </>
    ),
  },
];

function FeatureCards() {
  return (
    <section id="community" className="relative -mt-2 scroll-mt-24 bg-paper py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal
              key={f.id}
              as="article"
              delay={i * 120}
              className="group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-ink/8 bg-cream p-9 transition-all duration-500 hover:-translate-y-2 hover:border-water/30 hover:shadow-[0_40px_80px_-40px_rgba(11,58,82,0.45)]"
            >
              <div className="absolute -right-6 -top-6 font-display text-8xl font-extrabold text-ink/[0.04] transition-colors duration-500 group-hover:text-water/10">
                {f.n}
              </div>
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-water/10 text-brand transition-colors duration-500 group-hover:bg-water group-hover:text-cream">
                <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
                  {f.icon}
                </svg>
              </span>
              <h3 className="mt-7 font-display text-2xl font-bold text-ink">{f.title}</h3>
              <p className="mt-3 flex-1 leading-relaxed text-ink/65">{f.body}</p>
              <a
                href={`#${f.id === "mission" ? "mission" : f.id === "sundays" ? "sundays" : "connect"}`}
                className="mt-7 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-brand transition-colors hover:text-water"
              >
                {f.cta}
                <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1">
                  <path d="M4 10h11m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Mission band ───────────────────────────────────────────────────── */
function Mission() {
  return (
    <section id="mission" className="relative overflow-hidden bg-sand py-28 sm:py-40">
      <span className="pointer-events-none absolute -left-20 top-10 select-none font-serif text-[22rem] italic leading-none text-ink/[0.03]">
        &ldquo;
      </span>
      <div className="mx-auto max-w-5xl px-5 text-center sm:px-8">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-brand">Our Mission</p>
        </Reveal>
        <Reveal delay={120}>
          <p className="mx-auto mt-8 max-w-4xl text-balance font-display text-3xl font-semibold leading-[1.15] text-ink sm:text-5xl">
            To cultivate a Christlike community at Ohio State &mdash; growing His{" "}
            <span className="relative whitespace-nowrap text-brand">
              kingdom
              <svg viewBox="0 0 200 12" className="absolute -bottom-2 left-0 w-full text-water" preserveAspectRatio="none">
                <path d="M2 8C50 2 150 2 198 8" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
              </svg>
            </span>{" "}
            wherever we go.
          </p>
        </Reveal>
        <Reveal delay={240}>
          <p className="mx-auto mt-10 max-w-2xl font-serif text-xl italic leading-relaxed text-ink/60">
            &ldquo;Go therefore and make disciples of all nations.&rdquo; — the call that shapes
            everything we do on campus.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ── Current series / sermons ───────────────────────────────────────── */
const PLATFORMS = ["Spotify", "Apple Podcasts", "Spreaker"];

function CurrentSeries() {
  return (
    <section id="sundays" className="relative overflow-hidden bg-ink py-28 sm:py-36">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(70% 60% at 15% 20%, rgba(14,107,160,0.5), transparent 60%), radial-gradient(60% 60% at 90% 90%, rgba(88,207,228,0.18), transparent 60%)",
        }}
      />
      <div className="relative mx-auto grid max-w-7xl gap-16 px-5 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        {/* Series artwork */}
        <Reveal className="order-2 lg:order-1">
          <div className="group relative aspect-[4/5] max-w-md overflow-hidden rounded-3xl border border-white/10">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(155deg, #1e9bd7 0%, #0e6ba0 45%, #06212e 100%)",
              }}
            />
            <div className="absolute inset-0 opacity-30" style={{ animation: "float-slow 8s ease-in-out infinite" }}>
              <Droplet tone="light" className="absolute -right-10 -top-10 h-64 w-64" />
            </div>
            <div className="relative flex h-full flex-col justify-between p-9">
              <span className="w-fit rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-aqua backdrop-blur-sm">
                Now Streaming
              </span>
              <div>
                <p className="font-serif text-lg italic text-foam/70">A study in Romans</p>
                <h3 className="mt-2 font-display text-5xl font-extrabold leading-none text-cream">
                  The Real Gospel
                </h3>
                <p className="mt-4 text-sm text-foam/70">12 weeks · Grace & mission</p>
              </div>
            </div>
            <button
              aria-label="Play latest message"
              className="absolute bottom-6 right-6 flex h-16 w-16 items-center justify-center rounded-full bg-cream text-ink transition-transform duration-300 group-hover:scale-110"
            >
              <span className="absolute inset-0 rounded-full bg-cream/40" style={{ animation: "pulse-ring 2.4s ease-out infinite" }} />
              <svg viewBox="0 0 16 16" className="relative h-6 w-6 translate-x-0.5" fill="currentColor">
                <path d="M3 2l11 6-11 6z" />
              </svg>
            </button>
          </div>
        </Reveal>

        {/* Copy */}
        <div className="order-1 lg:order-2">
          <Reveal>
            <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.4em] text-aqua">
              <span className="h-px w-10 bg-aqua/60" />
              Current Series
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-6 font-display text-4xl font-extrabold leading-tight text-cream sm:text-5xl">
              We&apos;ve heard the call to <span className="text-aqua">&ldquo;Go.&rdquo;</span>
            </h2>
          </Reveal>
          <Reveal delay={180}>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-foam/75">
              Now it&apos;s time to discover what powers the mission. Over 12 weeks we&apos;re diving
              into Romans to uncover the deep mechanics of grace — not to boost our Bible knowledge,
              but to be moved by it. The mission isn&apos;t something we do to earn God&apos;s mercy;
              it&apos;s our response to mercy already given.
            </p>
          </Reveal>
          <Reveal delay={260}>
            <p className="mt-6 max-w-xl font-serif text-lg italic text-foam/60">
              Our prayer is that we&apos;d dive off the board into the whole swimming pool of the
              Christian life. Come get fueled.
            </p>
          </Reveal>
          <Reveal delay={340}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href="#sundays"
                className="inline-flex items-center gap-3 rounded-full bg-cream px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-ink transition-colors hover:bg-aqua"
              >
                Watch & Listen
              </a>
              <div className="flex flex-wrap items-center gap-2">
                {PLATFORMS.map((p) => (
                  <span
                    key={p}
                    className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-foam/60"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ── What's different ───────────────────────────────────────────────── */
const STATS = [
  { value: "2008", label: "Planted on campus" },
  { value: "OSU", label: "Where we gather" },
  { value: "7 days", label: "Community all week" },
];

function Different() {
  return (
    <section id="different" className="bg-paper py-28 sm:py-36">
      <div className="mx-auto grid max-w-7xl gap-16 px-5 sm:px-8 lg:grid-cols-2 lg:items-center">
        <div>
          <Reveal>
            <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.4em] text-brand">
              <span className="h-px w-10 bg-brand/50" />
              What&apos;s different about H2O?
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-6 max-w-lg text-balance font-display text-4xl font-extrabold leading-[1.05] text-ink sm:text-6xl">
              We are a campus-focused church community.
            </h2>
          </Reveal>
          <Reveal delay={180}>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink/65">
              H2O Church was founded in 2008 as a campus-focused church and, though our community
              has changed over the years, that continues to be the heartbeat of our mission and
              vision. Our services and community groups meet on campus at Ohio State — our priority
              is making disciples of all nations through making disciples at OSU.
            </p>
          </Reveal>
          <Reveal delay={260}>
            <a
              href="#connect"
              className="mt-9 inline-flex items-center gap-3 rounded-full bg-ink px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-cream transition-colors hover:bg-brand"
            >
              Learn More
              <svg viewBox="0 0 20 20" className="h-4 w-4">
                <path d="M4 10h11m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </Reveal>
        </div>

        <Reveal delay={200} className="grid gap-4">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={`flex items-baseline justify-between rounded-3xl border border-ink/8 bg-cream px-9 py-8 ${
                i === 1 ? "lg:ml-12" : ""
              }`}
            >
              <span className="font-display text-5xl font-extrabold text-brand sm:text-6xl">
                {s.value}
              </span>
              <span className="text-right text-sm font-semibold uppercase tracking-widest text-ink/50">
                {s.label}
              </span>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/* ── Connect / Give CTA ─────────────────────────────────────────────── */
function ConnectCTA() {
  return (
    <section id="connect" className="relative overflow-hidden bg-brand py-24 sm:py-28">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(50% 80% at 85% 10%, rgba(88,207,228,0.6), transparent 60%)",
        }}
      />
      <div className="relative mx-auto grid max-w-7xl gap-6 px-5 sm:px-8 lg:grid-cols-2">
        <Reveal
          as="article"
          className="group flex flex-col justify-between overflow-hidden rounded-[2rem] bg-cream p-10 sm:p-12"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-brand">New Here?</p>
            <h3 className="mt-5 font-display text-4xl font-extrabold leading-tight text-ink">
              Life is better together.
            </h3>
            <p className="mt-4 max-w-md leading-relaxed text-ink/65">
              As a local church, we live life together in community. Join a group meeting near you
              on campus this week.
            </p>
          </div>
          <a
            href="#connect"
            className="mt-9 inline-flex w-fit items-center gap-3 rounded-full bg-ink px-8 py-4 text-sm font-bold uppercase tracking-widest text-cream transition-colors group-hover:bg-water"
          >
            Join a Group
            <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1">
              <path d="M4 10h11m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </Reveal>

        <Reveal
          as="article"
          delay={140}
          id="give"
          className="group relative flex scroll-mt-28 flex-col justify-between overflow-hidden rounded-[2rem] border border-white/20 bg-ink/30 p-10 backdrop-blur-sm sm:p-12"
        >
          <div className="absolute -right-8 -top-8 opacity-20" style={{ animation: "float-slow 6s ease-in-out infinite" }}>
            <Droplet tone="light" className="h-40 w-40" />
          </div>
          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-aqua">Give</p>
            <h3 className="mt-5 font-display text-4xl font-extrabold leading-tight text-cream">
              Fuel the mission.
            </h3>
            <p className="mt-4 max-w-md leading-relaxed text-foam/80">
              Your generosity sends the gospel across campus and around the world. Give securely in
              a couple of taps.
            </p>
          </div>
          <a
            href="#give"
            className="relative mt-9 inline-flex w-fit items-center gap-3 rounded-full bg-cream px-8 py-4 text-sm font-bold uppercase tracking-widest text-ink transition-colors group-hover:bg-aqua"
          >
            Give Online
            <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1">
              <path d="M4 10h11m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
