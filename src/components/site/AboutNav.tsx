"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { label: "Who We Are", href: "/who-we-are" },
  { label: "What We Believe", href: "/what-we-believe" },
  { label: "Our Team", href: "/our-team" },
];

export function AboutNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-[68px] z-30 border-b border-ink/10 bg-paper/85 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-5 sm:px-8">
        {LINKS.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={`relative whitespace-nowrap px-4 py-4 text-sm font-bold uppercase tracking-widest transition-colors ${
                active ? "text-brand" : "text-ink/50 hover:text-ink"
              }`}
            >
              {l.label}
              <span
                className={`absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-brand transition-transform duration-300 ${
                  active ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
