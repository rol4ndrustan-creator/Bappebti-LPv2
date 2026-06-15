"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const PORTALS = [
  { label: "Situs Publik", href: "/publik" },
  { label: "Portal Bappebti", href: "/bappebti" },
  { label: "Portal Anggota", href: "/anggota" },
  { label: "Asosiasi", href: "/asosiasi" },
  { label: "Konsol Admin", href: "/admin" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-navy text-white">
      <div className="flex h-14 items-center gap-4 px-4">
        <Link href="/publik" className="flex items-center gap-2 shrink-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-md border-2 border-white/70 bg-navy-dark text-base font-bold">
            B
          </span>
          <span className="leading-tight hidden sm:block">
            <span className="block text-sm font-semibold">Layanan Pengaduan Bappebti</span>
            <span className="block text-[10px] text-white/70">
              Badan Pengawas Perdagangan Berjangka Komoditi
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 overflow-x-auto scrollbar-thin">
          {PORTALS.map((p) => {
            const active = pathname?.startsWith(p.href);
            return (
              <Link
                key={p.href}
                href={p.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
                  active ? "bg-white text-navy" : "text-white/80 hover:bg-white/10 hover:text-white"
                )}
              >
                {p.label.toUpperCase()}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
