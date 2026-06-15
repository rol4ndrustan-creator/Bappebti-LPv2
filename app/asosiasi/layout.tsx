import { PortalShell, SidebarItem } from "@/components/layout/portal-shell";
import { LayoutDashboard, Users, TrendingUp, BookOpen } from "lucide-react";

const iconCls = "size-4 shrink-0";

const sidebarItems: SidebarItem[] = [
  { label: "Dashboard Asosiasi", href: "/asosiasi", icon: <LayoutDashboard className={iconCls} /> },
  { label: "Kinerja Anggota", href: "/asosiasi/kinerja-anggota", icon: <Users className={iconCls} /> },
  { label: "Tren Industri", href: "/asosiasi/tren-industri", icon: <TrendingUp className={iconCls} /> },
  { label: "Topik Edukasi", href: "/asosiasi/topik-edukasi", icon: <BookOpen className={iconCls} /> },
];

export default function AsosiasiLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell title="Asosiasi" subtitle="Asosiasi Pialang Berjangka Indonesia" sidebarItems={sidebarItems}>
      {children}
    </PortalShell>
  );
}
