export type HeadingBlockProps = {
  text: string;
  level: "h1" | "h2" | "h3";
  align: "left" | "center";
};

const sizeMap: Record<HeadingBlockProps["level"], string> = {
  h1: "text-4xl sm:text-5xl font-bold",
  h2: "text-3xl sm:text-4xl font-bold",
  h3: "text-2xl sm:text-3xl font-semibold",
};

export function HeadingBlock({ text, level: Level, align }: HeadingBlockProps) {
  return (
    <div className="mx-auto max-w-4xl px-5 py-4">
      <Level
        className={`font-display text-ink ${sizeMap[Level]} ${align === "center" ? "text-center" : "text-left"}`}
      >
        {text}
      </Level>
    </div>
  );
}
