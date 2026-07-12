import { Logo } from "./Logo";

const SOCIALS: { label: string; href: string; path: string }[] = [
  {
    label: "Instagram",
    href: "https://instagram.com",
    path: "M12 2.2c3.2 0 3.6 0 4.9.07 1.2.06 1.8.25 2.2.42.6.2 1 .5 1.4.9.4.4.7.9.9 1.4.2.5.4 1.1.4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c0 1.1-.2 1.7-.4 2.2-.2.5-.5 1-.9 1.4-.4.4-.9.7-1.4.9-.5.2-1.1.4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.1 0-1.7-.2-2.2-.4a3.9 3.9 0 0 1-1.4-.9 3.9 3.9 0 0 1-.9-1.4c-.2-.5-.4-1.1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c0-1.1.2-1.7.4-2.2.2-.5.5-1 .9-1.4.4-.4.9-.7 1.4-.9.5-.2 1.1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2Zm0 3.2A6.6 6.6 0 1 0 18.6 12 6.6 6.6 0 0 0 12 5.4Zm0 10.9A4.3 4.3 0 1 1 16.3 12 4.3 4.3 0 0 1 12 16.3Zm6.9-11.2a1.54 1.54 0 1 1-1.54-1.54 1.54 1.54 0 0 1 1.54 1.54Z",
  },
  {
    label: "Facebook",
    href: "https://facebook.com",
    path: "M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z",
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    path: "M23.5 6.5a3 3 0 0 0-2.12-2.12C19.5 3.86 12 3.86 12 3.86s-7.5 0-9.38.52A3 3 0 0 0 .5 6.5 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.5 3 3 0 0 0 2.12 2.12c1.88.52 9.38.52 9.38.52s7.5 0 9.38-.52a3 3 0 0 0 2.12-2.12A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.5ZM9.6 15.6V8.4l6.24 3.6Z",
  },
  {
    label: "Spotify",
    href: "https://spotify.com",
    path: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.59 14.42a.62.62 0 0 1-.86.21c-2.35-1.44-5.3-1.76-8.79-.96a.62.62 0 1 1-.28-1.21c3.81-.87 7.08-.5 9.72 1.11a.62.62 0 0 1 .21.85Zm1.22-2.72a.78.78 0 0 1-1.07.26c-2.69-1.65-6.79-2.13-9.97-1.17a.78.78 0 1 1-.45-1.49c3.63-1.1 8.15-.56 11.24 1.33a.78.78 0 0 1 .25 1.07Zm.11-2.84C14.8 8.15 9.5 7.97 6.42 8.9a.93.93 0 1 1-.54-1.78c3.53-1.07 9.38-.86 13.08 1.34a.93.93 0 1 1-.95 1.6Z",
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
            {["Groups", "Sunday Gatherings", "Baptism", "Events", "Serve"].map((l) => (
              <a key={l} href="#connect" className="w-fit transition-colors hover:text-cream">
                {l}
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
            H2O Church — Columbus is a registered 501(c)(3) non-profit organization. © 2024 All
            Rights Reserved.
          </p>
          <p className="font-display uppercase tracking-[0.3em]">Est. 2008 · Ohio State</p>
        </div>
      </div>
    </footer>
  );
}
