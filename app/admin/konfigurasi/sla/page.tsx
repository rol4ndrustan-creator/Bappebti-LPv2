"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SLA_HISTORY } from "@/lib/mock-data";
import { useSlaHistory, addSlaEntry } from "@/lib/mock-service/sla-store";
import { useToast } from "@/components/shared/toast-provider";
import { Clock3 } from "lucide-react";

export default function SlaManagementPage() {
  const history = useSlaHistory(SLA_HISTORY);
  const current = history[0];
  const { showToast } = useToast();

  const [hours, setHours] = React.useState("");
  const [note, setNote] = React.useState("");

  function handleSubmit() {
    const value = Number(hours);
    if (!Number.isFinite(value) || value <= 0) return;
    addSlaEntry({
      id: `SLA-${Date.now().toString(36).toUpperCase()}`,
      hours: value,
      effectiveFrom: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
      changedBy: "Anda (Petugas Admin)",
      note: note.trim() || undefined,
    });
    showToast(`SLA baru (${value} jam) berhasil disimpan.`);
    setHours("");
    setNote("");
  }

  return (
    <div>
      <PageHeader
        title="Manajemen SLA"
        description="SLA respons pengaduan berlaku secara global dalam hitungan jam. Setiap perubahan dicatat pada riwayat di bawah."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-5 flex flex-col items-center justify-center text-center">
            <Clock3 className="size-6 text-navy mb-2" />
            <p className="text-[11px] uppercase tracking-wide text-muted font-medium">SLA Saat Ini</p>
            <p className="text-3xl font-semibold text-navy mt-1">{current?.hours ?? "-"} Jam</p>
            {current && (
              <p className="text-[11px] text-muted mt-1">
                Berlaku sejak {current.effectiveFrom} &middot; oleh {current.changedBy}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="py-4">
            <p className="text-xs font-semibold text-navy mb-2">Ubah SLA</p>
            <div className="flex flex-wrap items-end gap-2">
              <div className="w-40">
                <Label htmlFor="sla-hours">SLA Baru (Jam)</Label>
                <Input id="sla-hours" type="number" min={1} value={hours} onChange={(e) => setHours(e.target.value)} placeholder="Contoh: 48" />
              </div>
              <div className="flex-1 min-w-[220px]">
                <Label htmlFor="sla-note">Catatan Perubahan (opsional)</Label>
                <Textarea id="sla-note" value={note} onChange={(e) => setNote(e.target.value)} className="min-h-[38px] text-xs" />
              </div>
              <Button size="sm" disabled={!hours.trim()} onClick={handleSubmit}>
                Simpan SLA
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-sm font-semibold text-navy mt-6 mb-2">Riwayat Perubahan SLA</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Berlaku Sejak</TableHead>
            <TableHead>SLA (Jam)</TableHead>
            <TableHead>Diubah Oleh</TableHead>
            <TableHead>Catatan</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((h, i) => (
            <TableRow key={h.id}>
              <TableCell className="whitespace-nowrap font-medium">{h.effectiveFrom}</TableCell>
              <TableCell>{h.hours} jam</TableCell>
              <TableCell className="whitespace-nowrap text-muted">{h.changedBy}</TableCell>
              <TableCell className="max-w-[320px] text-muted">{h.note || "-"}</TableCell>
              <TableCell>{i === 0 ? <Badge variant="green">AKTIF</Badge> : <Badge variant="muted">RIWAYAT</Badge>}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
