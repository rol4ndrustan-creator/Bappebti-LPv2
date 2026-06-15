"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ROLES = [
  { label: "Platform / Pialang", href: "/anggota/platform" },
  { label: "Bursa", href: "/anggota/bursa" },
  { label: "Kliring", href: "/anggota/kliring" },
];

export default function AnggotaLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-1 min-h-0 flex-col">
      <div className="border-b border-border bg-card px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-thin">
        <span className="text-xs font-medium text-muted mr-2 shrink-0">PORTAL ANGGOTA &middot; PERAN:</span>
        {ROLES.map((r) => {
          const active = pathname?.startsWith(r.href);
          return (
            <Link
              key={r.href}
              href={r.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors border",
                active ? "bg-navy text-white border-navy" : "bg-white text-foreground border-border hover:bg-muted-bg"
              )}
            >
              {r.label}
            </Link>
          );
        })}
      </div>
      <div className="flex flex-1 min-h-0">{children}</div>
    </div>
  );
}
