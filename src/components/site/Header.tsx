"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "./Logo";

const NAV: { label: string; children: { label: string; href: string }[] }[] = [
  {
    label: "About",
    children: [
      { label: "Who We Are", href: "/who-we-are" },
      { label: "What We Believe", href: "/what-we-believe" },
      { label: "Our Team", href: "/our-team" },
    ],
  },
  {
    label: "Connect",
    children: [
      { label: "Groups", href: "/groups" },
      { label: "Sunday Gatherings", href: "/#sundays" },
      { label: "Baptism", href: "/#connect" },
      { label: "H2O Apparel", href: "/#connect" },
    ],
  },
  { label: "Events", children: [{ label: "Upcoming Events", href: "/events" }] },
  {
    label: "Serve",
    children: [
      { label: "Locally", href: "/#connect" },
      { label: "Globally", href: "/#connect" },
      { label: "At H2O", href: "/#connect" },
      { label: "Internship Program", href: "/#connect" },
    ],
  },
  { label: "Give", children: [{ label: "Give Online", href: "/give" }] },
];

export function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 bg-slate shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="shrink-0">
          <Logo tone="light" />
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          {NAV.map((item) => (
            <div key={item.label} className="group relative">
              <Link
                href={item.children[0]?.href ?? "/"}
                className="flex items-center gap-1 px-4 py-2 text-sm font-semibold uppercase tracking-wider text-white/85 transition-colors hover:text-white"
              >
                {item.label}
                {item.children.length > 1 ? (
                  <svg viewBox="0 0 10 6" className="h-1.5 w-2.5 opacity-70 transition-transform duration-300 group-hover:rotate-180">
                    <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  </svg>
                ) : null}
              </Link>
              {item.children.length > 1 ? (
                <div className="invisible absolute left-0 top-full w-56 translate-y-1 pt-2 opacity-0 transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="overflow-hidden rounded-md bg-brand py-1 shadow-xl">
                    {item.children.map((c) => (
                      <Link
                        key={c.label}
                        href={c.href}
                        className="block px-5 py-2.5 text-sm text-white/90 transition-colors hover:bg-white/10"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ))}
          <button aria-label="Search" className="ml-2 text-white/85 transition-colors hover:text-white">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4-4" strokeLinecap="round" />
            </svg>
          </button>
        </nav>

        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((o) => !o)}
          className="flex h-10 w-10 items-center justify-center text-white lg:hidden"
        >
          <span className="relative block h-3 w-5">
            <span className={`absolute left-0 top-0 h-0.5 w-5 bg-current transition-all duration-300 ${open ? "top-1.5 rotate-45" : ""}`} />
            <span className={`absolute left-0 top-1.5 h-0.5 w-5 bg-current transition-all duration-300 ${open ? "opacity-0" : ""}`} />
            <span className={`absolute left-0 top-3 h-0.5 w-5 bg-current transition-all duration-300 ${open ? "top-1.5 -rotate-45" : ""}`} />
          </span>
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`overflow-hidden bg-slate lg:hidden ${open ? "max-h-[90vh]" : "max-h-0"} transition-[max-height] duration-500`}>
        <nav className="flex flex-col px-6 pb-6">
          {NAV.flatMap((item) => item.children).map((c, i) => (
            <Link
              key={`${c.label}-${i}`}
              href={c.href}
              onClick={() => setOpen(false)}
              className="border-b border-white/10 py-3.5 text-sm font-semibold uppercase tracking-wider text-white/85 transition-colors hover:text-white"
            >
              {c.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
