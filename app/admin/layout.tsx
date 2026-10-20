import { PortalShell } from "@/components/layout/portal-shell";
import { BAPPEBTI_SIDEBAR_ITEMS } from "@/components/layout/bappebti-sidebar-items";
import { RequireInternalAuth } from "@/components/shared/require-internal-auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireInternalAuth>
      <PortalShell title="Portal Bappebti" subtitle="Regulator & Administrasi Sistem" sidebarItems={BAPPEBTI_SIDEBAR_ITEMS} portal="bappebti">
        {children}
      </PortalShell>
    </RequireInternalAuth>
  );
}
