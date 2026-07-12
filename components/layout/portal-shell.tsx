"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

// Only the single most-specific matching item should be highlighted — a
// naive per-item startsWith check would also match a portal's root
// "Dashboard" entry for every one of its sub-routes. Items whose href
// carries a query string (e.g. a tab pre-filter like ?tab=bappebti) only
// count as a match when the current URL's query actually agrees with it,
// so two nav items sharing the same path but different tabs highlight
// independently. `searchParams` is null during the static (pre-hydration)
// render, in which case query-carrying items are skipped in favor of their
// plain-path sibling — it corrects itself the instant the client hydrates.
function computeActiveHref(
  sidebarItems: SidebarItem[],
  pathname: string | null,
  searchParams: URLSearchParams | null
): string | null {
  if (!pathname) return null;
  let best: string | null = null;
  for (const item of sidebarItems) {
    const [itemPath, itemQuery] = item.href.split("?");
    const pathMatches = pathname === itemPath || pathname.startsWith(itemPath + "/");
    if (!pathMatches) continue;
    const queryMatches =
      !itemQuery ||
      (!!searchParams &&
        Array.from(new URLSearchParams(itemQuery).entries()).every(([key, value]) => searchParams.get(key) === value));
    if (queryMatches && (!best || item.href.length > best.length)) {
      best = item.href;
    }
  }
  return best;
}

function SidebarLinks({ sidebarItems, activeHref }: { sidebarItems: SidebarItem[]; activeHref: string | null }) {
  return (
    <nav className="flex flex-col gap-0.5 p-2">
      {sidebarItems.map((item) => {
        const active = item.href === activeHref;
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
  );
}

/** Resolves the active nav item against the real query string — isolated behind Suspense so useSearchParams doesn't force every statically-exported page using PortalShell into a CSR bailout. */
function SidebarLinksWithQuery({ sidebarItems, pathname }: { sidebarItems: SidebarItem[]; pathname: string | null }) {
  const searchParams = useSearchParams();
  const activeHref = useMemo(
    () => computeActiveHref(sidebarItems, pathname, searchParams),
    [sidebarItems, pathname, searchParams]
  );
  return <SidebarLinks sidebarItems={sidebarItems} activeHref={activeHref} />;
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
  const fallbackActiveHref = useMemo(() => computeActiveHref(sidebarItems, pathname, null), [sidebarItems, pathname]);

  return (
    <div className="flex flex-1 min-h-0">
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-border bg-card">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold text-navy">{title}</p>
          {subtitle && <p className="text-[11px] text-muted mt-0.5">{subtitle}</p>}
        </div>
        <Suspense fallback={<SidebarLinks sidebarItems={sidebarItems} activeHref={fallbackActiveHref} />}>
          <SidebarLinksWithQuery sidebarItems={sidebarItems} pathname={pathname} />
        </Suspense>
      </aside>
      <div className="flex-1 min-w-0 flex flex-col">
        {extraHeader}
        <main className="flex-1 p-4 md:p-6 max-w-[1400px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
