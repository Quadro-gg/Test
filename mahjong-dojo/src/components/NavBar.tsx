"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/lessons", label: "Lessons" },
  { href: "/drills", label: "Drills" },
  { href: "/play", label: "Play" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="bg-emerald-800 text-white">
      <div className="max-w-5xl mx-auto px-4 flex items-center h-14">
        <Link href="/" className="font-bold text-lg mr-8 tracking-tight">
          Mahjong Dojo
        </Link>
        <div className="flex gap-1">
          {NAV_ITEMS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                pathname === href
                  ? "bg-emerald-600"
                  : "hover:bg-emerald-700"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
        <div className="ml-auto">
          <Link
            href="/login"
            className="px-3 py-1.5 rounded text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </nav>
  );
}
