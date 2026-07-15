import { Logo } from "./Logo";

const SOCIALS: { label: string; href: string; path: string }[] = [
  {
    label: "Instagram",
    href: "https://instagram.com/h2ocolumbus",
    path: "M12 2.2c3.2 0 3.6 0 4.9.07 1.2.06 1.8.25 2.2.42.6.2 1 .5 1.4.9.4.4.7.9.9 1.4.2.5.4 1.1.4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c0 1.1-.2 1.7-.4 2.2-.2.5-.5 1-.9 1.4-.4.4-.9.7-1.4.9-.5.2-1.1.4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.1 0-1.7-.2-2.2-.4a3.9 3.9 0 0 1-1.4-.9 3.9 3.9 0 0 1-.9-1.4c-.2-.5-.4-1.1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c0-1.1.2-1.7.4-2.2.2-.5.5-1 .9-1.4.4-.4.9-.7 1.4-.9.5-.2 1.1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2Zm0 3.2A6.6 6.6 0 1 0 18.6 12 6.6 6.6 0 0 0 12 5.4Zm0 10.9A4.3 4.3 0 1 1 16.3 12 4.3 4.3 0 0 1 12 16.3Zm6.9-11.2a1.54 1.54 0 1 1-1.54-1.54 1.54 1.54 0 0 1 1.54 1.54Z",
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-abyss text-foam/70">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="grid gap-14 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo tone="light" />
            <p className="mt-6 max-w-sm font-serif text-lg italic leading-relaxed text-foam/60">
              A local church body cultivating a Christlike community at Ohio State — to grow His
              kingdom wherever we go.
            </p>
            <div className="mt-8 flex gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-foam/70 transition-all duration-300 hover:border-aqua/50 hover:bg-aqua/10 hover:text-aqua"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <nav className="flex flex-col gap-3 text-sm">
            <h3 className="mb-2 font-display text-xs font-bold uppercase tracking-[0.3em] text-aqua">
              Connect
            </h3>
            {[
              { label: "Groups", href: "/groups" },
              { label: "Sunday Gatherings", href: "/#sundays" },
              { label: "Sermons", href: "/sermons" },
              { label: "Events", href: "/events" },
              { label: "Give", href: "/give" },
            ].map((l) => (
              <a key={l.label} href={l.href} className="w-fit transition-colors hover:text-cream">
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex flex-col gap-4 text-sm">
            <h3 className="mb-2 font-display text-xs font-bold uppercase tracking-[0.3em] text-aqua">
              Visit
            </h3>
            <a
              href="https://maps.google.com/?q=1385+Neil+Ave+Columbus+OH+43201"
              className="flex items-start gap-2 transition-colors hover:text-cream"
            >
              <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-aqua" fill="none">
                <path
                  d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.6" />
              </svg>
              1385 Neil Ave
              <br />
              Columbus, OH 43201
            </a>
            <a href="tel:+16148595275" className="flex items-center gap-2 transition-colors hover:text-cream">
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-aqua" fill="none">
                <path
                  d="M6.6 3h3l1.5 5-2 1.3a12 12 0 0 0 5.6 5.6l1.3-2 5 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.6 5.2 2 2 0 0 1 6.6 3Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
              614-859-5275
            </a>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-foam/40 sm:flex-row">
          <p>
            H2O Church — Columbus is a registered 501(c)(3) non-profit organization. © 2026 All
            Rights Reserved.
          </p>
          <p className="font-display uppercase tracking-[0.3em]">Est. 2008 · Ohio State</p>
        </div>
      </div>
    </footer>
  );
}
