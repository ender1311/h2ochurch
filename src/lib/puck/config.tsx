import type { Config } from "@measured/puck";
import { HeroBlock, type HeroBlockProps } from "@/components/site/blocks/HeroBlock";
import { FeatureCardsBlock, type FeatureCardsBlockProps } from "@/components/site/blocks/FeatureCardsBlock";
import { SermonBandBlock, type SermonBandBlockProps } from "@/components/site/blocks/SermonBandBlock";
import { CommunityCarouselBlock, type CommunityCarouselBlockProps } from "@/components/site/blocks/CommunityCarouselBlock";
import { SocialBandBlock, type SocialBandBlockProps } from "@/components/site/blocks/SocialBandBlock";
import { ConnectCTABlock, type ConnectCTABlockProps } from "@/components/site/blocks/ConnectCTABlock";

type Props = {
  Hero: HeroBlockProps;
  FeatureCards: FeatureCardsBlockProps;
  SermonBand: SermonBandBlockProps;
  CommunityCarousel: CommunityCarouselBlockProps;
  SocialBand: SocialBandBlockProps;
  ConnectCTA: ConnectCTABlockProps;
};

export const config: Config<Props> = {
  components: {
    Hero: {
      fields: {
        headline: { type: "text" },
        subtext: { type: "textarea" },
        ctaLabel: { type: "text" },
        ctaHref: { type: "text" },
        videoSrc: { type: "text" },
        posterSrc: { type: "text" },
      },
      defaultProps: {
        headline: "Welcome to H2O",
        subtext: "We are a church on campus at Ohio State",
        ctaLabel: "Get Connected",
        ctaHref: "#connect",
        videoSrc: "/video/columbus-drone.mp4",
        posterSrc: "/video/columbus-drone-poster.webp",
      },
      render: (props) => <HeroBlock {...props} />,
    },
    FeatureCards: {
      fields: {
        cards: {
          type: "array",
          arrayFields: {
            id: { type: "text" },
            title: { type: "text" },
            body: { type: "textarea" },
            href: { type: "text" },
            icon: {
              type: "select",
              options: [
                { label: "Community", value: "community" },
                { label: "Mission", value: "mission" },
                { label: "Sundays", value: "sundays" },
              ],
            },
          },
        },
      },
      defaultProps: {
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
      render: (props) => <FeatureCardsBlock {...props} />,
    },
    SermonBand: {
      fields: {
        heading: { type: "text" },
        blurb: { type: "textarea" },
        ctaLabel: { type: "text" },
        ctaHref: { type: "text" },
        seriesLabel: { type: "text" },
        seriesTitle: { type: "text" },
        seriesBody: { type: "textarea" },
      },
      defaultProps: {
        heading: "Listen to Past Sermons",
        blurb: "Missed a Sunday, or want to revisit a message? Every sermon is available to watch and listen wherever you are.",
        ctaLabel: "Listen to Past Sermons",
        ctaHref: "/sermons",
        seriesLabel: "Current Series",
        seriesTitle: "The Real Gospel",
        seriesBody: `We've heard the call to "Go." Now it's time to discover what powers the mission. Over the next 12 weeks, we're diving into the book of Romans to uncover the deep mechanics of grace — not to boost our Bible knowledge, but to be moved by it. The mission isn't something we do to earn God's mercy; it's our response to mercy already given.\n\nEach week, sermons will be available on Spotify, Apple Podcasts, or wherever you get your podcasts.`,
      },
      render: (props) => <SermonBandBlock {...props} />,
    },
    CommunityCarousel: {
      fields: {
        eyebrow: { type: "text" },
        heading: { type: "textarea" },
        body: { type: "textarea" },
        ctaLabel: { type: "text" },
        ctaHref: { type: "text" },
      },
      defaultProps: {
        eyebrow: "What's Different About H2O?",
        heading: "We are a campus-focused church community",
        body: "H2O Church was founded in 2008 as a campus-focused church and, though our community has changed over the years, that continues to be the heartbeat of our mission & vision. Our services and community groups meet on campus at Ohio State & our priority is making disciples of all nations through making disciples at OSU.",
        ctaLabel: "Learn More",
        ctaHref: "/who-we-are",
      },
      render: (props) => <CommunityCarouselBlock {...props} />,
    },
    SocialBand: {
      fields: {
        heading: { type: "text" },
        ctaLabel: { type: "text" },
        href: { type: "text" },
      },
      defaultProps: {
        heading: "Follow Us on Social Media",
        ctaLabel: "Follow Us on Instagram",
        href: "https://instagram.com/h2ocolumbus",
      },
      render: (props) => <SocialBandBlock {...props} />,
    },
    ConnectCTA: {
      fields: {
        blurb: { type: "textarea" },
        ctaLabel: { type: "text" },
        ctaHref: { type: "text" },
      },
      defaultProps: {
        blurb: "New Here? As a local church, we live life together in community.",
        ctaLabel: "Join a Group",
        ctaHref: "/groups",
      },
      render: (props) => <ConnectCTABlock {...props} />,
    },
  },
};
