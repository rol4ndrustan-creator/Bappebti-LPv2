import { PortalShell, SidebarItem } from "@/components/layout/portal-shell";
import { LayoutDashboard, UserCog, KeyRound, Database, Route, Settings2, History } from "lucide-react";

const iconCls = "size-4 shrink-0";

const sidebarItems: SidebarItem[] = [
  { label: "Dashboard Admin", href: "/admin", icon: <LayoutDashboard className={iconCls} /> },
  { label: "User Management", href: "/admin/users", icon: <UserCog className={iconCls} /> },
  { label: "Role & Access", href: "/admin/roles", icon: <KeyRound className={iconCls} /> },
  { label: "Master Data Anggota", href: "/admin/anggota", icon: <Database className={iconCls} /> },
  { label: "Routing Mapping", href: "/admin/routing", icon: <Route className={iconCls} /> },
  { label: "SLA & Workflow", href: "/admin/sla-workflow", icon: <Settings2 className={iconCls} /> },
  { label: "Audit Logs", href: "/admin/audit-logs", icon: <History className={iconCls} /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell title="Konsol Admin" subtitle="Manajemen Sistem" sidebarItems={sidebarItems}>
      {children}
    </PortalShell>
  );
}
