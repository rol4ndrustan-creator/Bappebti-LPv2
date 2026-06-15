import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ADMIN_USERS, MEMBERS, AUDIT_LOGS, ROUTING_MAP, PLATFORM_LIST } from "@/lib/mock-data";
import { Users, UserCheck, Building2, Route, Settings2, History } from "lucide-react";

export default function AdminDashboardPage() {
  const activeUsers = ADMIN_USERS.filter((u) => u.status === "Aktif").length;
  const pendingApprovals = ADMIN_USERS.filter((u) => u.status === "Menunggu Persetujuan").length;
  const registeredMembers = MEMBERS.length;
  const missingRouting = PLATFORM_LIST.filter(
    (p) => p !== "Tidak tahu / belum terdaftar" && !ROUTING_MAP[p]
  ).length;
  const slaRulesConfigured = 8;
  const auditLogsToday = AUDIT_LOGS.filter((a) => a.timestamp.startsWith("15 Jun 2026")).length;

  const recentAuditLogs = AUDIT_LOGS.slice(0, 5);
  const pendingUsers = ADMIN_USERS.filter((u) => u.status === "Menunggu Persetujuan");

  return (
    <div>
      <PageHeader
        title="Dashboard Admin"
        description="Ringkasan operasional sistem: pengguna, anggota terdaftar, konfigurasi routing, SLA, dan aktivitas audit."
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-4">
        <KpiCard label="Active Users" value={activeUsers} icon={Users} tone="navy" />
        <KpiCard label="Pending User Approvals" value={pendingApprovals} icon={UserCheck} tone="amber" />
        <KpiCard label="Registered Members" value={registeredMembers} icon={Building2} tone="default" />
        <KpiCard label="Missing Routing Mappings" value={missingRouting} icon={Route} tone={missingRouting > 0 ? "amber" : "green"} />
        <KpiCard label="SLA Rules Configured" value={slaRulesConfigured} icon={Settings2} tone="default" />
        <KpiCard label="Audit Logs Today" value={auditLogsToday} icon={History} tone="navy" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Object</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAuditLogs.map((log, i) => (
                  <TableRow key={i}>
                    <TableCell className="whitespace-nowrap">{log.timestamp}</TableCell>
                    <TableCell>{log.actor}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell className="text-navy font-medium">{log.object}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <div className="px-4 py-2 border-t border-border text-xs">
            <Link href="/admin/audit-logs" className="text-navy hover:underline">
              Lihat semua audit logs &rarr;
            </Link>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pengguna Menunggu Persetujuan</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted py-4">
                      Tidak ada pengguna menunggu persetujuan.
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingUsers.map((u) => (
                    <TableRow key={u.email}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.role}</TableCell>
                      <TableCell><Badge variant="amber">{u.status.toUpperCase()}</Badge></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
          <div className="px-4 py-2 border-t border-border text-xs">
            <Link href="/admin/users" className="text-navy hover:underline">
              Kelola User Management &rarr;
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
