type LogoProps = {
  className?: string;
  tone?: "light" | "dark";
};

export function Logo({ className = "", tone = "dark" }: LogoProps) {
  const text = tone === "light" ? "text-white" : "text-ink";
  const sub = tone === "light" ? "text-white/80" : "text-ink/60";

  return (
    <span className={`inline-flex flex-col items-center leading-none ${className}`}>
      <span className={`font-display text-3xl font-bold tracking-tight ${text}`}>
        H<span className="align-baseline text-[0.7em]">2</span>O
      </span>
      <span className={`mt-1 text-[0.6rem] font-medium uppercase tracking-[0.55em] ${sub}`}>
        Church
      </span>
    </span>
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
