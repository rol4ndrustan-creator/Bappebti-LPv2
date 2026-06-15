import { PageHeader } from "@/components/shared/page-header";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { TrendBadge, RiskBadge } from "@/components/shared/badges";
import { MEMBERS } from "@/lib/mock-data";

export default function KinerjaAnggotaPage() {
  return (
    <div>
      <PageHeader
        title="Kinerja Anggota"
        description="Ringkasan agregat kinerja penanganan pengaduan masing-masing anggota. Data ditampilkan pada tingkat anggota tanpa rincian identitas pelapor."
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Anggota</TableHead>
            <TableHead>Total Pengaduan</TableHead>
            <TableHead>SLA Breach</TableHead>
            <TableHead>Kategori Dominan</TableHead>
            <TableHead>Tren</TableHead>
            <TableHead>Risk Level</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {MEMBERS.map((m) => (
            <TableRow key={m.name}>
              <TableCell className="font-medium text-navy">{m.name}</TableCell>
              <TableCell>{m.totalCases}</TableCell>
              <TableCell>{m.slaBreach}</TableCell>
              <TableCell>{m.category || "-"}</TableCell>
              <TableCell><TrendBadge trend={m.trend} /></TableCell>
              <TableCell><RiskBadge risk={m.risk} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
