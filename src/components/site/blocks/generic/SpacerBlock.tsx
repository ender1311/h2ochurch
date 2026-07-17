export type SpacerBlockProps = {
  size: "sm" | "md" | "lg";
};

const heightMap: Record<SpacerBlockProps["size"], string> = {
  sm: "h-6",
  md: "h-12",
  lg: "h-24",
};

export function SpacerBlock({ size }: SpacerBlockProps) {
  return <div aria-hidden="true" className={heightMap[size]} />;
}
