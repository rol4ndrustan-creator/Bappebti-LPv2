import { PortalShell, SidebarItem } from "@/components/layout/portal-shell";
import {
  LayoutDashboard,
  ListChecks,
  FileSearch,
  ShieldAlert,
  Users,
  MessageSquareWarning,
  FileBarChart,
} from "lucide-react";

const iconCls = "size-4 shrink-0";

const sidebarItems: SidebarItem[] = [
  { label: "Dashboard Eksekutif", href: "/bappebti", icon: <LayoutDashboard className={iconCls} /> },
  { label: "Antrean Operasional", href: "/bappebti/antrean", icon: <ListChecks className={iconCls} /> },
  { label: "Detail Kasus", href: "/bappebti/kasus", icon: <FileSearch className={iconCls} /> },
  { label: "Pemantauan Risiko", href: "/bappebti/risiko", icon: <ShieldAlert className={iconCls} /> },
  { label: "Kinerja Anggota", href: "/bappebti/kinerja-anggota", icon: <Users className={iconCls} /> },
  { label: "Kritik / Masukan", href: "/bappebti/kritik-masukan", icon: <MessageSquareWarning className={iconCls} /> },
  { label: "Laporan & Ekspor", href: "/bappebti/laporan", icon: <FileBarChart className={iconCls} /> },
];

export default function BappebtiLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell title="Portal Bappebti" subtitle="Regulator Workbench" sidebarItems={sidebarItems}>
      {children}
    </PortalShell>
  );
}
