import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { SeverityBadge, StatusBadge, OwnerBadge } from "@/components/shared/badges";
import { CASES } from "@/lib/mock-data";
import { ArrowRight } from "lucide-react";

export default function DetailKasusIndexPage() {
  return (
    <div>
      <PageHeader
        title="Detail Kasus"
        description="Pilih kasus untuk melihat detail lengkap, termasuk kronologi, bukti, respons anggota, dan jejak audit."
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tiket</TableHead>
            <TableHead>Pengaduan</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead>Tingkat</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Current Owner</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {CASES.map((c) => (
            <TableRow key={c.ticket}>
              <TableCell className="font-medium text-navy whitespace-nowrap">{c.ticket}</TableCell>
              <TableCell className="max-w-[280px] truncate">{c.title}</TableCell>
              <TableCell className="text-muted whitespace-nowrap">{c.platform}</TableCell>
              <TableCell>
                <SeverityBadge severity={c.severity} />
              </TableCell>
              <TableCell>
                <StatusBadge status={c.status} />
              </TableCell>
              <TableCell>
                <OwnerBadge owner={c.currentOwner} />
              </TableCell>
              <TableCell>
                <Link
                  href={`/bappebti/kasus/${c.ticket}`}
                  className="text-navy inline-flex items-center gap-1 hover:underline whitespace-nowrap"
                >
                  Lihat Detail <ArrowRight className="size-3" />
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
