"use client";

import { useEffect, useState } from "react";
import { Logo } from "./Logo";

const NAV: { label: string; children: { label: string; href: string }[] }[] = [
  {
    label: "About",
    children: [
      { label: "Who We Are", href: "#different" },
      { label: "What We Believe", href: "#mission" },
      { label: "Our Team", href: "#different" },
    ],
  },
  {
    label: "Connect",
    children: [
      { label: "Groups", href: "#community" },
      { label: "Sunday Gatherings", href: "#sundays" },
      { label: "Baptism", href: "#connect" },
      { label: "H2O Apparel", href: "#connect" },
    ],
  },
  { label: "Events", children: [{ label: "Upcoming Events", href: "#connect" }] },
  {
    label: "Serve",
    children: [
      { label: "Locally", href: "#connect" },
      { label: "Globally", href: "#connect" },
      { label: "At H2O", href: "#connect" },
      { label: "Internship Program", href: "#connect" },
    ],
  },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-ink/85 py-3 shadow-[0_12px_40px_-24px_rgba(4,28,40,0.9)] backdrop-blur-xl"
          : "bg-transparent py-5"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="#top" className="group">
          <Logo tone="light" className="transition-transform duration-500 group-hover:-translate-y-0.5" />
        </a>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <div key={item.label} className="group relative">
              <button className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-widest text-foam/80 transition-colors hover:text-cream">
                {item.label}
                <svg viewBox="0 0 10 6" className="h-1.5 w-2.5 transition-transform duration-300 group-hover:rotate-180">
                  <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                </svg>
              </button>
              <div className="invisible absolute left-0 top-full w-52 translate-y-2 pt-2 opacity-0 transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink/95 p-1.5 shadow-2xl backdrop-blur-xl">
                  {item.children.map((c) => (
                    <a
                      key={c.label}
                      href={c.href}
                      className="block rounded-xl px-4 py-2.5 text-sm text-foam/75 transition-colors hover:bg-water/20 hover:text-cream"
                    >
                      {c.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#give"
            className="hidden rounded-full bg-cream px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-ink transition-all duration-300 hover:bg-aqua hover:text-ink sm:inline-block"
          >
            Give
          </a>
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((o) => !o)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-cream lg:hidden"
          >
            <span className="relative block h-3 w-4">
              <span
                className={`absolute left-0 top-0 h-0.5 w-4 bg-current transition-all duration-300 ${
                  open ? "top-1.5 rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-1.5 h-0.5 w-4 bg-current transition-all duration-300 ${
                  open ? "opacity-0" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-3 h-0.5 w-4 bg-current transition-all duration-300 ${
                  open ? "top-1.5 -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 top-0 z-40 flex flex-col bg-ink/98 px-6 pt-24 backdrop-blur-xl transition-all duration-500 lg:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <nav className="flex flex-col gap-1">
          {NAV.flatMap((item) => item.children).map((c, i) => (
            <a
              key={`${c.label}-${i}`}
              href={c.href}
              onClick={() => setOpen(false)}
              className="border-b border-white/5 py-4 font-display text-2xl font-semibold text-foam/85 transition-colors hover:text-aqua"
            >
              {c.label}
            </a>
          ))}
          <a
            href="#give"
            onClick={() => setOpen(false)}
            className="mt-6 rounded-full bg-cream py-4 text-center text-lg font-bold uppercase tracking-widest text-ink"
          >
            Give
          </a>
        </nav>
      </div>
    </header>
  );
}
