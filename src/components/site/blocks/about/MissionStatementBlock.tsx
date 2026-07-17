import { Reveal } from "@/components/Reveal";

export type MissionStatementBlockProps = {
  eyebrow: string;
  missionText: string;
  emphasizedWord: string;
  missionTextAfter: string;
};

export function MissionStatementBlock({
  eyebrow,
  missionText,
  emphasizedWord,
  missionTextAfter,
}: MissionStatementBlockProps) {
  return (
    <section className="bg-paper py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-brand">{eyebrow}</p>
        </Reveal>
        <Reveal delay={120}>
          <p className="mx-auto mt-8 max-w-3xl text-balance font-display text-3xl font-semibold leading-[1.15] text-ink sm:text-5xl">
            {missionText}{" "}
            <span className="relative whitespace-nowrap text-brand">
              {emphasizedWord}
              <svg
                viewBox="0 0 200 12"
                className="absolute -bottom-2 left-0 w-full text-water"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 8C50 2 150 2 198 8"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>{" "}
            {missionTextAfter}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
