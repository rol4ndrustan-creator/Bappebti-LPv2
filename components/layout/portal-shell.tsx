"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  /**
   * Nested sub-links rendered under a collapsible group instead of a direct
   * link. When present, the item renders as an expand/collapse toggle (not
   * a link itself) — `href` is only used to decide whether the group's
   * section is currently active (pathname === href or a sub-path of it),
   * so the group auto-expands and highlights while the user is in it.
   */
  children?: SidebarItem[];
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
    // Groups manage their own active/expanded state (see SidebarGroup) —
    // they're excluded here so they don't compete with regular items for
    // the single "best match" this function returns.
    if (item.children && item.children.length > 0) continue;
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

function SidebarGroup({ item, pathname }: { item: SidebarItem; pathname: string | null }) {
  const sectionActive = !!pathname && (pathname === item.href || pathname.startsWith(item.href + "/"));
  // Expanded by default whenever navigation is inside this section; a
  // manual toggle (open/close click) overrides that default from then on.
  const [manualOpen, setManualOpen] = useState<boolean | null>(null);
  const open = manualOpen ?? sectionActive;

  return (
    <div>
      <button
        type="button"
        onClick={() => setManualOpen(!open)}
        aria-expanded={open}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors",
          sectionActive ? "bg-navy/10 text-navy" : "text-foreground hover:bg-muted-bg"
        )}
      >
        {item.icon}
        <span className="flex-1 text-left">{item.label}</span>
        <ChevronDown className={cn("size-3.5 shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="ml-4 mt-0.5 mb-0.5 flex flex-col gap-0.5 border-l border-border pl-3">
          {item.children!.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className="rounded-md px-2 py-1.5 text-[11.5px] font-medium text-foreground/80 transition-colors hover:bg-muted-bg hover:text-navy"
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function SidebarLinks({
  sidebarItems,
  activeHref,
  pathname,
}: {
  sidebarItems: SidebarItem[];
  activeHref: string | null;
  pathname?: string | null;
}) {
  return (
    <nav className="flex flex-col gap-0.5 p-2">
      {sidebarItems.map((item) => {
        if (item.children && item.children.length > 0) {
          return <SidebarGroup key={item.href} item={item} pathname={pathname ?? null} />;
        }
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
  return <SidebarLinks sidebarItems={sidebarItems} activeHref={activeHref} pathname={pathname} />;
}

export function PortalShell({
  title,
  subtitle,
  sidebarItems,
  children,
  extraHeader,
  asideFooter,
  portal,
}: {
  title: string;
  subtitle?: string;
  sidebarItems: SidebarItem[];
  children: React.ReactNode;
  extraHeader?: React.ReactNode;
  /** Rendered at the bottom of the sidebar, below the nav links (e.g. a logout button). */
  asideFooter?: React.ReactNode;
  /** Scopes the per-portal accent color (see [data-portal] rules in globals.css). Omit to use the default (Bappebti navy). */
  portal?: string;
}) {
  const pathname = usePathname();
  const fallbackActiveHref = useMemo(() => computeActiveHref(sidebarItems, pathname, null), [sidebarItems, pathname]);

  return (
    <div className="flex flex-1 min-h-0" data-portal={portal}>
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-border bg-card">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold text-navy">{title}</p>
          {subtitle && <p className="text-[11px] text-muted mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex-1 overflow-y-auto">
          <Suspense fallback={<SidebarLinks sidebarItems={sidebarItems} activeHref={fallbackActiveHref} pathname={pathname} />}>
            <SidebarLinksWithQuery sidebarItems={sidebarItems} pathname={pathname} />
          </Suspense>
        </div>
        {asideFooter && <div className="border-t border-border p-2">{asideFooter}</div>}
      </aside>
      <div className="flex-1 min-w-0 flex flex-col">
        {extraHeader}
        <main className="flex-1 p-4 md:p-6 max-w-[1400px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
