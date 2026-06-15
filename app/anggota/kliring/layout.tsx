import { PortalShell, SidebarItem } from "@/components/layout/portal-shell";
import { LayoutDashboard, Landmark, FileSearch, FileCheck2, FileBarChart } from "lucide-react";

const iconCls = "size-4 shrink-0";

const sidebarItems: SidebarItem[] = [
  { label: "Dashboard Kliring", href: "/anggota/kliring", icon: <LayoutDashboard className={iconCls} /> },
  { label: "Settlement Queue", href: "/anggota/kliring/settlement-queue", icon: <Landmark className={iconCls} /> },
  { label: "Reconciliation Review", href: "/anggota/kliring/reconciliation-review", icon: <FileSearch className={iconCls} /> },
  { label: "Settlement Evidence", href: "/anggota/kliring/settlement-evidence", icon: <FileCheck2 className={iconCls} /> },
  { label: "Reporting", href: "/anggota/kliring/reporting", icon: <FileBarChart className={iconCls} /> },
];

export default function KliringLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell title="Kliring" subtitle="Kliring Berjangka Indonesia" sidebarItems={sidebarItems}>
      {children}
    </PortalShell>
  );
}
