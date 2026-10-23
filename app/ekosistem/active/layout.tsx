import { PortalShell, SidebarItem } from "@/components/layout/portal-shell";
import { LayoutDashboard, ListChecks, ClipboardCheck, Users } from "lucide-react";

const iconCls = "size-4 shrink-0";

const sidebarItems: SidebarItem[] = [
  { label: "Dashboard Overview", href: "/ekosistem/active", icon: <LayoutDashboard className={iconCls} /> },
  { label: "Manajemen Pengaduan", href: "/ekosistem/active/pengaduan", icon: <ListChecks className={iconCls} /> },
  { label: "Manajemen Tugas", href: "/ekosistem/active/tugas", icon: <ClipboardCheck className={iconCls} /> },
  { label: "Data Member", href: "/ekosistem/active/member", icon: <Users className={iconCls} /> },
];

export default function EkosistemActiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell title="Ekosistem Active" subtitle="Infrastruktur Pasar — Bursa, Kliring, Custody" sidebarItems={sidebarItems} portal="ekosistem">
      {children}
    </PortalShell>
  );
}
