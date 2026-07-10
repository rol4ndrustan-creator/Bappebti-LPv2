import { PortalShell, SidebarItem } from "@/components/layout/portal-shell";
import { LayoutDashboard, ListChecks, Clock, MessageCircle, FileBarChart } from "lucide-react";

const iconCls = "size-4 shrink-0";

const sidebarItems: SidebarItem[] = [
  { label: "Dashboard Platform", href: "/platform", icon: <LayoutDashboard className={iconCls} /> },
  { label: "Case Queue", href: "/platform/case-queue", icon: <ListChecks className={iconCls} /> },
  { label: "SLA & Resolution", href: "/platform/sla-resolution", icon: <Clock className={iconCls} /> },
  { label: "Klarifikasi", href: "/platform/klarifikasi", icon: <MessageCircle className={iconCls} /> },
  { label: "Reporting", href: "/platform/reporting", icon: <FileBarChart className={iconCls} /> },
];

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell title="Portal Platform" subtitle="PT Bursa Digital Nusantara" sidebarItems={sidebarItems}>
      {children}
    </PortalShell>
  );
}
