import { HeroBlock } from "@/components/site/blocks/HeroBlock";
import { FeatureCardsBlock } from "@/components/site/blocks/FeatureCardsBlock";
import { SermonBandBlock } from "@/components/site/blocks/SermonBandBlock";
import { CommunityCarouselBlock } from "@/components/site/blocks/CommunityCarouselBlock";
import { SocialBandBlock } from "@/components/site/blocks/SocialBandBlock";
import { ConnectCTABlock } from "@/components/site/blocks/ConnectCTABlock";

export function DefaultHome() {
  return (
    <main id="top">
      <HeroBlock
        headline="Welcome to H2O"
        subtext="We are a church on campus at Ohio State"
        ctaLabel="Get Connected"
        ctaHref="#connect"
        videoSrc="/video/columbus-drone.mp4"
        posterSrc="/video/columbus-drone-poster.webp"
      />
      <FeatureCardsBlock
        cards={[
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
        ]}
      />
      <SermonBandBlock
        heading="Listen to Past Sermons"
        blurb="Missed a Sunday, or want to revisit a message? Every sermon is available to watch and listen wherever you are."
        ctaLabel="Listen to Past Sermons"
        ctaHref="/sermons"
        seriesLabel="Current Series"
        seriesTitle="The Real Gospel"
        seriesBody={`We've heard the call to "Go." Now it's time to discover what powers the mission. Over the next 12 weeks, we're diving into the book of Romans to uncover the deep mechanics of grace — not to boost our Bible knowledge, but to be moved by it. The mission isn't something we do to earn God's mercy; it's our response to mercy already given.\n\nEach week, sermons will be available on Spotify, Apple Podcasts, or wherever you get your podcasts.`}
      />
      <CommunityCarouselBlock
        eyebrow="What's Different About H2O?"
        heading="We are a campus-focused church community"
        body="H2O Church was founded in 2008 as a campus-focused church and, though our community has changed over the years, that continues to be the heartbeat of our mission & vision. Our services and community groups meet on campus at Ohio State & our priority is making disciples of all nations through making disciples at OSU."
        ctaLabel="Learn More"
        ctaHref="/who-we-are"
      />
      <SocialBandBlock
        heading="Follow Us on Social Media"
        ctaLabel="Follow Us on Instagram"
        href="https://instagram.com/h2ocolumbus"
      />
      <ConnectCTABlock
        blurb="New Here? As a local church, we live life together in community."
        ctaLabel="Join a Group"
        ctaHref="/groups"
      />
    </main>
  );
}
