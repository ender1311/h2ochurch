import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { Carousel } from "@/components/site/Carousel";
import { COMMUNITY_PHOTOS } from "@/lib/photos";

export default function Home() {
  return (
    <main id="top">
      <Hero />
      <FeatureCards />
      <SermonBand />
      <Different />
      <SocialBand />
      <ConnectCTA />
    </main>
  );
}

/* ── Hero ───────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="relative flex min-h-[70vh] items-center overflow-hidden bg-slate">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/video/columbus-drone-poster.webp"
        aria-hidden="true"
      >
        <source src="/video/columbus-drone.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-r from-charcoal/85 via-charcoal/60 to-charcoal/30" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-24 sm:px-8">
        <h1 className="animate-rise font-display text-5xl font-bold leading-none text-white sm:text-7xl" style={{ animationDelay: "0.1s" }}>
          Welcome to H2O
        </h1>
        <p className="animate-rise mt-5 max-w-xl text-lg font-medium uppercase tracking-[0.15em] text-white/85 sm:text-2xl" style={{ animationDelay: "0.25s" }}>
          We are a church on campus at Ohio State
        </p>
        <div className="animate-rise mt-9" style={{ animationDelay: "0.4s" }}>
          <Link
            href="#connect"
            className="inline-block bg-white px-9 py-4 text-sm font-bold uppercase tracking-widest text-slate transition-colors hover:bg-brand hover:text-white"
          >
            Get Connected
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Feature cards ──────────────────────────────────────────────────── */
const FEATURES = [
  {
    id: "community",
    title: "Our Community",
    body: "As a church body, we live life together. Our Bible studies and community groups meet throughout the week on different parts of campus. Click below for more info!",
    href: "/groups",
    icon: (
      <>
        <circle cx="8" cy="9" r="3" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="17" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3 20c0-3 2.2-5 5-5s5 2 5 5M14 20c0-2.2 1.4-3.8 3.4-3.8S21 17.8 21 20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: "mission",
    title: "Our Mission",
    body: "We are a local church body committed to cultivating a Christlike community at OSU to grow His kingdom wherever we go.",
    href: "/who-we-are",
    icon: <path d="M4 12l16-8-6 16-3.5-6.5L4 12z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="none" />,
  },
  {
    id: "sundays",
    title: "Sundays",
    body: "We gather together on Sunday mornings to worship together and connect as a church community!",
    href: "/#sundays",
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
    <section id="community" className="scroll-mt-24 bg-white py-20 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 sm:px-8 md:grid-cols-3">
        {FEATURES.map((f, i) => (
          <Reveal
            key={f.id}
            as="article"
            delay={i * 120}
            className="flex flex-col items-center border border-black/5 bg-white p-9 text-center shadow-[0_10px_40px_-15px_rgba(43,51,60,0.18)]"
          >
            <span className="text-brand">
              <svg viewBox="0 0 24 24" fill="none" className="h-12 w-12">
                {f.icon}
              </svg>
            </span>
            <h3 className="mt-5 font-display text-xl font-bold uppercase tracking-wide text-slate">{f.title}</h3>
            <p className="mt-4 flex-1 text-sm leading-relaxed text-ink/70">{f.body}</p>
            <Link
              href={f.href}
              className="mt-7 bg-brand px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-deep"
            >
              Learn More
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ── Sermon band ────────────────────────────────────────────────────── */
function SermonBand() {
  return (
    <section id="sundays" className="relative scroll-mt-24 overflow-hidden py-20 sm:py-28">
      <Image src="/images/worship-night.webp" alt="" fill sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-brand/90" />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-2">
        <Reveal>
          <div className="flex items-center gap-4">
            <span className="h-px w-10 bg-white/60" />
            <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-white">Listen to Past Sermons</h2>
          </div>
          <p className="mt-6 max-w-md text-white/85">
            Missed a Sunday, or want to revisit a message? Every sermon is available to watch and listen
            wherever you are.
          </p>
          <Link
            href="/sermons"
            className="mt-8 inline-flex items-center gap-3 border border-white/60 px-7 py-3.5 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-brand"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-current">
              <svg viewBox="0 0 12 12" className="h-3 w-3 translate-x-px" fill="currentColor">
                <path d="M2 1l8 5-8 5z" />
              </svg>
            </span>
            Listen to Past Sermons
          </Link>
        </Reveal>

        <Reveal delay={150}>
          <div className="flex items-center gap-4">
            <span className="h-px w-10 bg-white/60" />
            <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-white">Current Series</h2>
          </div>
          <h3 className="mt-5 font-display text-2xl font-bold uppercase text-white">The Real Gospel</h3>
          <p className="mt-4 text-sm leading-relaxed text-white/80">
            We&apos;ve heard the call to &ldquo;Go.&rdquo; Now it&apos;s time to discover what powers the
            mission. Over the next 12 weeks, we&apos;re diving into the book of Romans to uncover the deep
            mechanics of grace — not to boost our Bible knowledge, but to be moved by it. The mission
            isn&apos;t something we do to earn God&apos;s mercy; it&apos;s our response to mercy already given.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-white/80">
            Each week, sermons will be available on Spotify, Apple Podcasts, or wherever you get your podcasts.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ── What's different ───────────────────────────────────────────────── */
function Different() {
  return (
    <section id="different" className="scroll-mt-24 bg-white py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2">
        <div>
          <Reveal>
            <div className="flex items-center gap-4">
              <span className="h-px w-10 bg-brand" />
              <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-brand">What&apos;s Different About H2O?</h2>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h3 className="mt-6 font-display text-4xl font-bold leading-tight text-slate sm:text-5xl">
              We are a campus-focused church community
            </h3>
          </Reveal>
          <Reveal delay={180}>
            <p className="mt-6 max-w-lg leading-relaxed text-ink/70">
              H2O Church was founded in 2008 as a campus-focused church and, though our community has
              changed over the years, that continues to be the heartbeat of our mission &amp; vision. Our
              services and community groups meet on campus at Ohio State &amp; our priority is making
              disciples of all nations through making disciples at OSU.
            </p>
          </Reveal>
          <Reveal delay={260}>
            <Link
              href="/who-we-are"
              className="mt-8 inline-block bg-brand px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-deep"
            >
              Learn More
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

/* ── Social band ────────────────────────────────────────────────────── */
function SocialBand() {
  return (
    <section className="bg-sand py-20 text-center">
      <div className="mx-auto max-w-3xl px-5">
        <div className="flex items-center justify-center gap-4">
          <span className="h-px w-10 bg-brand" />
          <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-brand">Follow Us on Social Media</h2>
          <span className="h-px w-10 bg-brand" />
        </div>
        <a
          href="https://instagram.com/h2ocolumbus"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-block bg-brand px-9 py-4 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-deep"
        >
          Follow Us on Instagram
        </a>
      </div>
    </section>
  );
}

/* ── Connect / Give banner ──────────────────────────────────────────── */
function ConnectCTA() {
  return (
    <section id="connect" className="scroll-mt-24 bg-brand py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-5 sm:px-8 md:flex-row">
        <div className="flex items-center gap-6">
          <span className="flex flex-col items-center leading-none">
            <span className="font-display text-3xl font-bold text-white">
              H<span className="text-[0.7em]">2</span>O
            </span>
            <span className="mt-1 text-[0.6rem] font-medium uppercase tracking-[0.5em] text-white/80">Church</span>
          </span>
          <p className="max-w-md text-white/90">
            <span className="font-bold">New Here?</span> As a local church, we live life together in community.
          </p>
        </div>
        <Link
          href="/groups"
          className="shrink-0 border border-white px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-brand"
        >
          Join a Group
        </Link>
      </div>
    </section>
  );
}
