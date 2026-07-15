import Image from "next/image";

type LogoProps = {
  className?: string;
  tone?: "light" | "dark";
};

const BRAND = {
  light: { src: "/images/brand/h2o-logo-white.png", width: 3078, height: 1797 },
  dark: { src: "/images/brand/h2o-logo-color.png", width: 2945, height: 1666 },
} as const;

export function Logo({ className = "h-11 w-auto", tone = "dark" }: LogoProps) {
  const { src, width, height } = BRAND[tone];

  return (
    <Image
      src={src}
      alt="H2O Church"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}

export function Droplet({
  className = "",
  tone = "dark",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <svg viewBox="0 0 32 40" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`drop-${tone}`} x1="6" y1="2" x2="26" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={tone === "light" ? "#58cfe4" : "#1e9bd7"} />
          <stop offset="1" stopColor={tone === "light" ? "#1e9bd7" : "#0b3a52"} />
        </linearGradient>
      </defs>
      <path
        d="M16 1.5C16 1.5 3 16.5 3 25.5C3 32.68 8.82 38.5 16 38.5C23.18 38.5 29 32.68 29 25.5C29 16.5 16 1.5 16 1.5Z"
        fill={`url(#drop-${tone})`}
      />
      <path
        d="M10.5 26.5C10.5 30 12.9 32.6 16 32.9"
        stroke={tone === "light" ? "#d9f2f7" : "#d9f2f7"}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
}
