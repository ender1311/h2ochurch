"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { label: "Dashboard", href: "/admin", exact: true, icon: "M4 13h6V4H4v9zm0 7h6v-5H4v5zm10 0h6v-9h-6v9zm0-16v5h6V4h-6z" },
  { label: "People", href: "/admin/people", icon: "M8 11a3 3 0 100-6 3 3 0 000 6zm8 0a3 3 0 100-6 3 3 0 000 6zM2 20c0-3 2.5-5 6-5s6 2 6 5M14 20c0-2.5 1.8-4.2 4-4.2s4 1.7 4 4.2" },
  { label: "Groups", href: "/admin/groups", icon: "M4 6h16M4 12h16M4 18h10" },
  { label: "Events", href: "/admin/events", icon: "M4 5h16v16H4zM4 9h16M8 3v4M16 3v4" },
  { label: "Services", href: "/admin/services", icon: "M9 18V6l10-2v12M9 18a3 3 0 11-6 0 3 3 0 016 0zm10-2a3 3 0 11-6 0 3 3 0 016 0z" },
  { label: "Sermons", href: "/admin/sermons", icon: "M12 2a3 3 0 00-3 3v5a3 3 0 006 0V5a3 3 0 00-3-3zM5 10a7 7 0 0014 0M12 17v4M8 21h8" },
  { label: "Giving", href: "/admin/giving", icon: "M12 3v18M8 7h6a2.5 2.5 0 010 5H8m0 0h7a2.5 2.5 0 010 5H7" },
  { label: "Check-Ins", href: "/admin/checkins", icon: "M9 11l3 3 8-8M4 12v6a2 2 0 002 2h12" },
  { label: "Calendar", href: "/admin/calendar", icon: "M4 5h16v16H4zM4 9h16M8 3v4M16 3v4" },
  { label: "Import / Export", href: "/admin/import", icon: "M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" },
  { label: "Settings", href: "/admin/settings", icon: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-2.7 1.1V21a2 2 0 11-4 0v-.1A1.6 1.6 0 004.6 19l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.6 1.6 0 00-1.1-2.7H.5a2 2 0 110-4h.1A1.6 1.6 0 002 4.6l-.1-.1a2 2 0 112.8-2.8l.1.1a1.6 1.6 0 001.8.3H7a1.6 1.6 0 001-1.5V.5a2 2 0 114 0v.1a1.6 1.6 0 001 1.5 1.6 1.6 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 00-.3 1.8V7a1.6 1.6 0 001.5 1H21a2 2 0 110 4h-.1a1.6 1.6 0 00-1.5 1z" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
              active ? "bg-water/15 text-cream" : "text-foam/60 hover:bg-white/5 hover:text-cream"
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d={item.icon} />
            </svg>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
