export type ImageBlockProps = {
  src: string;
  alt: string;
  maxWidth: "sm" | "md" | "lg" | "full";
};

const maxWidthMap: Record<ImageBlockProps["maxWidth"], string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
  full: "max-w-4xl",
};

export function ImageBlock({ src, alt, maxWidth }: ImageBlockProps) {
  if (!src) return null;
  return (
    <div className="mx-auto max-w-4xl px-5 py-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={`mx-auto rounded-2xl ${maxWidthMap[maxWidth]} w-full object-cover`}
      />
    </div>
  );
}
