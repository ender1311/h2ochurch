export type TextBlockProps = {
  text: string;
  align: "left" | "center";
};

export function TextBlock({ text, align }: TextBlockProps) {
  const paragraphs = text.split("\n\n").filter(Boolean);
  return (
    <div className="mx-auto max-w-4xl px-5 py-4">
      <div className={`space-y-4 ${align === "center" ? "text-center" : "text-left"}`}>
        {paragraphs.map((p, i) => (
          <p key={i} className="text-base leading-relaxed text-ink">
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}
