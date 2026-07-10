import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { SlaBadge } from "@/components/shared/badges";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { CASES, formatCurrency } from "@/lib/mock-data";
import {
  Landmark,
  FileSearch,
  AlertTriangle,
  Clock,
  FileCheck2,
} from "lucide-react";

const settlementCases = CASES.filter((c) => c.category === "Settlement / Kliring");
const reconciliationCases = settlementCases.filter((c) => !!c.reconciliationIssue);
const reconciliationMismatch = 2;
const waitingPlatformData = 1;
const resolvedSettlement = 3;

const dueSoonCases = settlementCases
  .filter((c) => c.slaStatus === "Mendekati SLA" || c.slaStatus === "Aman")
  .sort((a, b) => a.slaDeadline.localeCompare(b.slaDeadline));

const taskDescription = (ticket: string): string => {
  switch (ticket) {
    case "BPP-2026-000186":
      return "Rekonsiliasi ulang batch settlement STL-2026-06-330217 dan verifikasi selisih saldo aset.";
    case "BPP-2026-000191":
      return "Konfirmasi referensi settlement STL-2026-06-330452 dengan bank dan sesuaikan saldo akun.";
    default:
      return "Tinjau kasus settlement dan tindak lanjuti sesuai prosedur rekonsiliasi.";
  }
};

const missingProof = [
  { ticket: "BPP-2026-000186", note: "Bukti konfirmasi bank untuk batch STL-2026-06-330217 belum diterima dari platform." },
  { ticket: "BPP-2026-000191", note: "Salinan instruksi transfer terkait STL-2026-06-330452 belum dilengkapi." },
];

export default function KliringDashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard Kliring"
        description="Ringkasan operasional Kliring Berjangka Indonesia untuk penyelesaian settlement, rekonsiliasi, dan pencocokan transaksi."
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <KpiCard label="Kasus Settlement" value={settlementCases.length} icon={Landmark} tone="navy" hint="Kategori Settlement / Kliring" />
        <KpiCard label="Referensi Settlement Tertunda" value={reconciliationCases.length} icon={FileSearch} tone="amber" hint="Menunggu rekonsiliasi" />
        <KpiCard label="Mismatch Rekonsiliasi" value={reconciliationMismatch} icon={AlertTriangle} tone="red" hint="Ditemukan pada batch settlement" />
        <KpiCard label="Menunggu Data Platform" value={waitingPlatformData} icon={Clock} tone="amber" hint="Permintaan data terkirim" />
        <KpiCard label="Kasus Settlement Selesai" value={resolvedSettlement} icon={FileCheck2} tone="green" hint="Bulan ini" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader>
            <CardTitle>Tugas Settlement</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiket</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Tugas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settlementCases.map((c) => (
                  <TableRow key={c.ticket}>
                    <TableCell className="font-medium text-navy">{c.ticket}</TableCell>
                    <TableCell className="max-w-[140px] truncate text-muted">{c.platform}</TableCell>
                    <TableCell className="max-w-[260px]">{taskDescription(c.ticket)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pengecualian Rekonsiliasi</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiket</TableHead>
                  <TableHead>Transaction Ref</TableHead>
                  <TableHead>Pengecualian</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reconciliationCases.map((c) => (
                  <TableRow key={c.ticket}>
                    <TableCell className="font-medium text-navy">{c.ticket}</TableCell>
                    <TableCell className="text-muted">{c.transactionRef}</TableCell>
                    <TableCell className="max-w-[260px]">{c.reconciliationIssue}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Bukti Settlement Belum Lengkap</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiket</TableHead>
                  <TableHead>Catatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {missingProof.map((m) => (
                  <TableRow key={m.ticket}>
                    <TableCell className="font-medium text-navy">{m.ticket}</TableCell>
                    <TableCell className="max-w-[320px] text-muted">{m.note}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tinjauan Settlement Mendekati Tenggat</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiket</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>SLA</TableHead>
                  <TableHead>Batas Waktu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dueSoonCases.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted py-4">
                      Tidak ada tinjauan settlement yang mendekati tenggat.
                    </TableCell>
                  </TableRow>
                )}
                {dueSoonCases.map((c) => (
                  <TableRow key={c.ticket}>
                    <TableCell className="font-medium text-navy">{c.ticket}</TableCell>
                    <TableCell>{formatCurrency(c.amount)}</TableCell>
                    <TableCell><SlaBadge sla={c.slaStatus} /></TableCell>
                    <TableCell className="text-muted">{c.slaDeadline}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
