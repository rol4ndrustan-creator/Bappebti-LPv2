"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { usePublikAuth } from "@/lib/publik-auth";
import { Bell, FileText, LayoutDashboard, PlusCircle, UserCircle } from "lucide-react";

const LINKS = [
  { label: "Dashboard", href: "/publik/dashboard", icon: LayoutDashboard },
  { label: "Pengaduan Saya", href: "/publik/pengaduan", icon: FileText },
  { label: "Buat Pengaduan", href: "/publik/pengaduan/baru", icon: PlusCircle },
  { label: "Notifikasi", href: "/publik/notifikasi", icon: Bell },
  { label: "Profil", href: "/publik/profil", icon: UserCircle },
];

const NO_NAV_PATHS = ["/publik", "/publik/login", "/publik/register"];

export default function PublikLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, ready, logout } = usePublikAuth();
  const requiresAuth = !NO_NAV_PATHS.includes(pathname || "");

  React.useEffect(() => {
    if (requiresAuth && ready && !isAuthenticated) {
      router.replace("/publik/login");
    }
  }, [requiresAuth, ready, isAuthenticated, router]);

  function handleLogout() {
    logout();
    router.push("/publik");
  }

  // Only registered users who have logged in can reach the authenticated
  // portal pages (dashboard, pengaduan, notifikasi, profil).
  if (requiresAuth && (!ready || !isAuthenticated)) return null;

  return (
    <div className="flex flex-1 min-h-0 flex-col">
      {requiresAuth && (
        <div className="border-b border-border bg-card px-4 py-2 flex items-center gap-1 overflow-x-auto scrollbar-thin">
          {LINKS.map((l) => {
            const active = pathname === l.href || (l.href !== "/publik/pengaduan" && pathname?.startsWith(l.href)) || (l.href === "/publik/pengaduan" && pathname?.startsWith("/publik/pengaduan") && !pathname?.startsWith("/publik/pengaduan/baru"));
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
                  active ? "bg-navy text-white" : "text-foreground hover:bg-muted-bg"
                )}
              >
                <Icon className="size-3.5" />
                {l.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={handleLogout}
            className="ml-auto rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap text-muted hover:bg-muted-bg hover:text-foreground"
          >
            Keluar
          </button>
        </div>
      )}
      <main className="flex-1 max-w-[1400px] w-full mx-auto p-4 md:p-6">{children}</main>
    </div>
  );
}
