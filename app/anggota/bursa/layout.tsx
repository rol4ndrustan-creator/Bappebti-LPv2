import { PortalShell, SidebarItem } from "@/components/layout/portal-shell";
import { LayoutDashboard, Building2, ArrowUpRight, ClipboardList, MessageCircle, FileBarChart } from "lucide-react";

const iconCls = "size-4 shrink-0";

const sidebarItems: SidebarItem[] = [
  { label: "Dashboard Bursa", href: "/anggota/bursa", icon: <LayoutDashboard className={iconCls} /> },
  { label: "Platform Monitoring", href: "/anggota/bursa/platform-monitoring", icon: <Building2 className={iconCls} /> },
  { label: "Escalation Queue", href: "/anggota/bursa/escalation-queue", icon: <ArrowUpRight className={iconCls} /> },
  { label: "Supervisory Actions", href: "/anggota/bursa/supervisory-actions", icon: <ClipboardList className={iconCls} /> },
  { label: "Klarifikasi", href: "/anggota/bursa/klarifikasi", icon: <MessageCircle className={iconCls} /> },
  { label: "Reporting", href: "/anggota/bursa/reporting", icon: <FileBarChart className={iconCls} /> },
];

export default function BursaLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell title="Bursa" subtitle="Bursa Berjangka Jakarta" sidebarItems={sidebarItems}>
      {children}
    </PortalShell>
  );
}
