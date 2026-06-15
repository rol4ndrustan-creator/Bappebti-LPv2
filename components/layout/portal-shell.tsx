"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export function PortalShell({
  title,
  subtitle,
  sidebarItems,
  children,
  extraHeader,
}: {
  title: string;
  subtitle?: string;
  sidebarItems: SidebarItem[];
  children: React.ReactNode;
  extraHeader?: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-1 min-h-0">
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-border bg-card">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold text-navy">{title}</p>
          {subtitle && <p className="text-[11px] text-muted mt-0.5">{subtitle}</p>}
        </div>
        <nav className="flex flex-col gap-0.5 p-2">
          {sidebarItems.map((item) => {
            const active = pathname === item.href || (item.href !== "" && pathname?.startsWith(item.href + "/"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors",
                  active ? "bg-navy text-white" : "text-foreground hover:bg-muted-bg"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex-1 min-w-0 flex flex-col">
        {extraHeader}
        <main className="flex-1 p-4 md:p-6 max-w-[1400px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
