import { PortalShell, SidebarItem } from "@/components/layout/portal-shell";
import { LayoutDashboard, ListChecks, ClipboardCheck, Users } from "lucide-react";

const iconCls = "size-4 shrink-0";

const sidebarItems: SidebarItem[] = [
  { label: "Dashboard Overview", href: "/ekosistem/pengawas", icon: <LayoutDashboard className={iconCls} /> },
  { label: "Manajemen Pengaduan", href: "/ekosistem/pengawas/pengaduan", icon: <ListChecks className={iconCls} /> },
  { label: "Manajemen Tugas", href: "/ekosistem/pengawas/tugas", icon: <ClipboardCheck className={iconCls} /> },
  { label: "Data Member", href: "/ekosistem/pengawas/member", icon: <Users className={iconCls} /> },
];

export default function EkosistemPengawasLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell title="Ekosistem Pengawas" subtitle="ASPEBTINDO & BAKTI — Pengawasan Kepatuhan Industri" sidebarItems={sidebarItems} portal="ekosistem">
      {children}
    </PortalShell>
  );
}
