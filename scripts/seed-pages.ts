// scripts/seed-pages.ts
// Seed the "home" page with a Puck document that reproduces the current design,
// into both draft_data and published_data. Idempotent by slug.
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}
const sb = createClient(url, key, { auth: { persistSession: false } });

const homeData = {
  root: { props: {} },
  content: [
    {
      type: "Hero",
      props: {
        id: "Hero-1",
        headline: "Welcome to H2O",
        subtext: "We are a church on campus at Ohio State",
        ctaLabel: "Get Connected",
        ctaHref: "#connect",
        videoSrc: "/video/columbus-drone.mp4",
        posterSrc: "/video/columbus-drone-poster.webp",
      },
    },
    {
      type: "FeatureCards",
      props: {
        id: "FeatureCards-1",
        cards: [
          {
            id: "community",
            title: "Our Community",
            body: "As a church body, we live life together. Our Bible studies and community groups meet throughout the week on different parts of campus. Click below for more info!",
            href: "/groups",
            icon: "community",
          },
          {
            id: "mission",
            title: "Our Mission",
            body: "We are a local church body committed to cultivating a Christlike community at OSU to grow His kingdom wherever we go.",
            href: "/who-we-are",
            icon: "mission",
          },
          {
            id: "sundays",
            title: "Sundays",
            body: "We gather together on Sunday mornings to worship together and connect as a church community!",
            href: "/#sundays",
            icon: "sundays",
          },
        ],
      },
    },
    {
      type: "SermonBand",
      props: {
        id: "SermonBand-1",
        heading: "Listen to Past Sermons",
        blurb: "Missed a Sunday, or want to revisit a message? Every sermon is available to watch and listen wherever you are.",
        ctaLabel: "Listen to Past Sermons",
        ctaHref: "/sermons",
        seriesLabel: "Current Series",
        seriesTitle: "The Real Gospel",
        seriesBody: `We've heard the call to "Go." Now it's time to discover what powers the mission. Over the next 12 weeks, we're diving into the book of Romans to uncover the deep mechanics of grace — not to boost our Bible knowledge, but to be moved by it. The mission isn't something we do to earn God's mercy; it's our response to mercy already given.\n\nEach week, sermons will be available on Spotify, Apple Podcasts, or wherever you get your podcasts.`,
      },
    },
    {
      type: "CommunityCarousel",
      props: {
        id: "CommunityCarousel-1",
        eyebrow: "What's Different About H2O?",
        heading: "We are a campus-focused church community",
        body: "H2O Church was founded in 2008 as a campus-focused church and, though our community has changed over the years, that continues to be the heartbeat of our mission & vision. Our services and community groups meet on campus at Ohio State & our priority is making disciples of all nations through making disciples at OSU.",
        ctaLabel: "Learn More",
        ctaHref: "/who-we-are",
      },
    },
    {
      type: "SocialBand",
      props: {
        id: "SocialBand-1",
        heading: "Follow Us on Social Media",
        ctaLabel: "Follow Us on Instagram",
        href: "https://instagram.com/h2ocolumbus",
      },
    },
    {
      type: "ConnectCTA",
      props: {
        id: "ConnectCTA-1",
        blurb: "New Here? As a local church, we live life together in community.",
        ctaLabel: "Join a Group",
        ctaHref: "/groups",
      },
    },
  ],
};

const { error } = await sb.from("pages").upsert(
  { slug: "home", title: "Homepage", draft_data: homeData, published_data: homeData },
  { onConflict: "slug" },
);
if (error) {
  console.error(error.message);
  process.exit(1);
}
console.log("✓ Seeded home page");
