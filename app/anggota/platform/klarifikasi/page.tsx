"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CASES } from "@/lib/mock-data";
import { useToast } from "@/components/shared/toast-provider";

interface ClarificationRow {
  ticket: string;
  requestedFrom: string;
  requestDate: string;
  deadline: string;
  status: "Menunggu Respon" | "Selesai";
  lastResponse: string;
}

function buildRows(): ClarificationRow[] {
  const rows: ClarificationRow[] = [];

  for (const c of CASES) {
    if (!c.clarifications || c.clarifications.length === 0) continue;
    const last = c.clarifications[c.clarifications.length - 1];
    const platformRequested = c.clarifications.find((cl) => cl.role === "Platform");
    if (!platformRequested) continue;

    const requestedFrom = "Pelapor";
    const hasReply = c.clarifications.length > 1 && last.role !== "Platform";

    rows.push({
      ticket: c.ticket,
      requestedFrom,
      requestDate: platformRequested.datetime,
      deadline: c.slaDeadline,
      status: hasReply ? "Selesai" : "Menunggu Respon",
      lastResponse: hasReply ? last.message : "-",
    });
  }

  // Additional mock rows for richness (Bappebti requesting clarification from platform)
  rows.push({
    ticket: "BPP-2026-000191",
    requestedFrom: "Bappebti",
    requestDate: "15 Jun 2026, 13:00",
    deadline: "18 Jun 2026, 12:00",
    status: "Menunggu Respon",
    lastResponse: "-",
  });
  rows.push({
    ticket: "BPP-2026-000192",
    requestedFrom: "Bursa",
    requestDate: "15 Jun 2026, 08:30",
    deadline: "17 Jun 2026, 17:00",
    status: "Menunggu Respon",
    lastResponse: "-",
  });

  return rows;
}

export default function KlarifikasiPage() {
  const { showToast } = useToast();
  const rows = buildRows();

  return (
    <div>
      <PageHeader
        title="Klarifikasi"
        description="Daftar permintaan klarifikasi terkait kasus yang ditangani oleh Platform / Pialang, baik kepada pelapor maupun dari regulator/bursa kepada platform."
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tiket</TableHead>
            <TableHead>Diminta Dari</TableHead>
            <TableHead>Tanggal Permintaan</TableHead>
            <TableHead>Batas Waktu</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Respon Terakhir</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={`${r.ticket}-${i}`}>
              <TableCell className="font-medium text-navy">{r.ticket}</TableCell>
              <TableCell>{r.requestedFrom}</TableCell>
              <TableCell className="text-muted">{r.requestDate}</TableCell>
              <TableCell className="text-muted">{r.deadline}</TableCell>
              <TableCell>
                <Badge variant={r.status === "Selesai" ? "green" : "amber"}>
                  {r.status.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell className="max-w-[260px] truncate text-muted">{r.lastResponse}</TableCell>
              <TableCell>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => showToast(`Membuka detail klarifikasi untuk ${r.ticket} (demo).`)}
                >
                  Lihat Detail
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
