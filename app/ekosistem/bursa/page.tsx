import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { StatusBadge, SlaBadge, RiskBadge } from "@/components/shared/badges";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CASES, MEMBERS, ACTIVE_BURSA } from "@/lib/mock-data";
import {
  Building2,
  ClipboardList,
  AlertTriangle,
  ArrowUpRight,
  ShieldAlert,
  Gauge,
} from "lucide-react";

const monitoredMembers = MEMBERS.filter((m) => m.bursa === ACTIVE_BURSA);
const bursaCases = CASES.filter((c) => c.bursaEntity === ACTIVE_BURSA);
const overdueCases = bursaCases.filter((c) => c.slaStatus === "Lewat SLA");
const escalationCases = bursaCases.filter((c) => c.currentOwner === "Bursa");
const criticalCases = bursaCases.filter((c) => c.severity === "Kritis");

const slaCompliance = Math.round(
  monitoredMembers.reduce((sum, m) => sum + m.slaPercent, 0) / monitoredMembers.length
);

const oversightAlerts = [
  {
    title: "PT Monex Investindo Futures: 4 kasus melewati SLA bulan ini",
    detail: "Jumlah keterlambatan meningkat dibandingkan bulan sebelumnya, perlu tindak lanjut supervisi.",
  },
  {
    title: "Tren keterlambatan respon meningkat pada kategori Layanan / respon platform",
    detail: "Dua kasus berada dalam status eskalasi karena platform tidak merespons dalam batas waktu SLA.",
  },
  {
    title: "PT Rifan Financindo Berjangka: kasus kritis terkait dugaan fraud sedang dipantau",
    detail: "Bursa memantau perkembangan investigasi yang dilakukan Bappebti terhadap kasus terkait.",
  },
];

const slaBreachTrend = [
  { month: "Mar 2026", count: 3 },
  { month: "Apr 2026", count: 5 },
  { month: "Mei 2026", count: 4 },
  { month: "Jun 2026", count: 6 },
];
const maxBreach = Math.max(...slaBreachTrend.map((t) => t.count));

const worstPlatforms = [...monitoredMembers].sort((a, b) => a.slaPercent - b.slaPercent);

export default function DashboardBursaPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard Bursa"
        description={`Ringkasan pengawasan platform yang berada di bawah supervisi ${ACTIVE_BURSA}.`}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <KpiCard label="Platform Dipantau" value={monitoredMembers.length} icon={Building2} tone="navy" hint="Anggota di bawah Bursa ini" />
        <KpiCard label="Total Kasus" value={bursaCases.length} icon={ClipboardList} tone="navy" hint="Seluruh kasus terkait platform" />
        <KpiCard label="Kasus Lewat SLA" value={overdueCases.length} icon={AlertTriangle} tone="red" hint="Memerlukan tindakan segera" />
        <KpiCard label="Antrean Eskalasi" value={escalationCases.length} icon={ArrowUpRight} tone="amber" hint="Diambil alih Bursa" />
        <KpiCard label="Kasus Kritis" value={criticalCases.length} icon={ShieldAlert} tone="red" hint="Severitas kritis" />
        <KpiCard label="SLA Compliance Platform" value={`${slaCompliance}%`} icon={Gauge} tone="green" hint="Rata-rata 2 platform dipantau" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader>
            <CardTitle>Peringatan Pengawasan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {oversightAlerts.map((a, i) => (
              <div key={i} className="rounded-md border border-amber/30 bg-amber-bg px-3 py-2">
                <p className="text-xs font-medium text-navy">{a.title}</p>
                <p className="text-[11px] text-muted mt-0.5">{a.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Berkinerja Terburuk</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Platform</TableHead>
                  <TableHead>SLA %</TableHead>
                  <TableHead>Risiko</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {worstPlatforms.map((m) => (
                  <TableRow key={m.name}>
                    <TableCell className="font-medium text-navy">{m.name}</TableCell>
                    <TableCell>{m.slaPercent}%</TableCell>
                    <TableCell><RiskBadge risk={m.risk} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex items-center justify-between flex-row">
            <CardTitle>Eskalasi Terbaru</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href="/ekosistem/bursa/escalation-queue">Lihat Escalation Queue</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiket</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Pengaduan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>SLA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {escalationCases.map((c) => (
                  <TableRow key={c.ticket}>
                    <TableCell className="font-medium text-navy">{c.ticket}</TableCell>
                    <TableCell className="max-w-[140px] truncate">{c.platform}</TableCell>
                    <TableCell className="max-w-[160px] truncate">{c.title}</TableCell>
                    <TableCell><StatusBadge status={c.status} /></TableCell>
                    <TableCell><SlaBadge sla={c.slaStatus} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tren Pelanggaran SLA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4 h-40">
              {slaBreachTrend.map((t) => (
                <div key={t.month} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col justify-end items-center" style={{ height: "120px" }}>
                    <span className="text-xs font-semibold text-navy mb-1">{t.count}</span>
                    <div
                      className="w-full max-w-10 rounded-t-md bg-navy"
                      style={{ height: `${(t.count / maxBreach) * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-muted">{t.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
