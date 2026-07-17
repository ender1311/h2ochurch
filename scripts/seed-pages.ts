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

const whoWeAreData = {
  root: { props: {} },
  content: [
    {
      type: "WhoWeAreHero",
      props: {
        id: "WhoWeAreHero-1",
        eyebrow: "About H2O",
        title: "Who We Are",
        subtitle: "A local church living life together on campus at Ohio State — following Jesus and inviting others to do the same.",
      },
    },
    {
      type: "MissionStatement",
      props: {
        id: "MissionStatement-1",
        eyebrow: "Our Mission",
        missionText: "Cultivating a Christlike community at OSU to grow His",
        emphasizedWord: "kingdom",
        missionTextAfter: "wherever we go.",
      },
    },
    {
      type: "CoreValues",
      props: {
        id: "CoreValues-1",
        eyebrow: "Our Core Values",
        heading: "A church of",
        tovWord: "Tov",
        tovHebrew: "(טוב)",
        bodyBefore: "We hold four primary values, each aimed to help us cultivate a Christlike community at OSU by being a church of ",
        bodyTovWord: "Tov",
        bodyAfter: `. Tov is the Hebrew word the Bible uses to describe “Goodness” — something that fully embodies the divine purpose for which God has designed it.`,
        values: [
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
        ],
      },
    },
  ],
};

const whatWeBelieveData = {
  root: { props: {} },
  content: [
    {
      type: "WhatWeBelieveHero",
      props: {
        id: "WhatWeBelieveHero-1",
        eyebrow: "About H2O",
        title: "What We Believe",
        subtitle: "We're an orthodox Christian church. These are the core convictions that anchor everything we do.",
      },
    },
    {
      type: "BeliefsGrid",
      props: {
        id: "BeliefsGrid-1",
        beliefs: [
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
        ],
      },
    },
  ],
};

const ourTeamData = {
  root: { props: {} },
  content: [
    {
      type: "OurTeamHero",
      props: {
        id: "OurTeamHero-1",
        eyebrow: "About H2O",
        title: "Our Team",
        subtitle: "As a local church, we live life together in community. Meet the people who help make that happen.",
      },
    },
    {
      type: "TeamGrid",
      props: {
        id: "TeamGrid-1",
        members: [
          { name: "Kathy Borsos", role: "Executive Director", since: 2009 },
          { name: "Mike Malone", role: "Church Life Director", since: 2000 },
          { name: "Jeremy Borsos", role: "Staff", since: 2009 },
          { name: "Will Houghton", role: "Worship Lead Intern", since: 2025 },
          { name: "Aziz Nahhas", role: "Staff Support", since: 1991 },
          { name: "Diane Gress", role: "Staff Support", since: 2016 },
          { name: "Maggie Luk", role: "Staff Support", since: 2014 },
          { name: "Vivake Baranwal", role: "Staff Support", since: 2012 },
        ],
        contactHeading: "Reach the pastoral team",
        contactBody: "We'd love to hear from you — questions, prayer, or just to say hi.",
        contactEmail: "pastors@h2osu.org",
      },
    },
  ],
};

const pages = [
  { slug: "home", title: "Homepage", data: homeData },
  { slug: "who-we-are", title: "Who We Are", data: whoWeAreData },
  { slug: "what-we-believe", title: "What We Believe", data: whatWeBelieveData },
  { slug: "our-team", title: "Our Team", data: ourTeamData },
];

for (const page of pages) {
  const { error } = await sb.from("pages").upsert(
    { slug: page.slug, title: page.title, draft_data: page.data, published_data: page.data },
    { onConflict: "slug" },
  );
  if (error) {
    console.error(`${page.slug}: ${error.message}`);
    process.exit(1);
  }
  console.log(`✓ Seeded ${page.slug}`);
}
