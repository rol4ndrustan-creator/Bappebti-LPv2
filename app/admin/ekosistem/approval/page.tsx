"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ECOSYSTEM_ENTITIES } from "@/lib/mock-data";
import { useEcosystemEntities, decideEcosystemEntity } from "@/lib/mock-service/ecosystem-store";
import { EcosystemEntity } from "@/lib/types";
import { useToast } from "@/components/shared/toast-provider";
import { CheckCircle2, XCircle } from "lucide-react";

export default function PersetujuanPendaftaranPage() {
  const entities = useEcosystemEntities(ECOSYSTEM_ENTITIES);
  const { showToast } = useToast();
  const pending = entities.filter((e) => e.status === "Menunggu Persetujuan");

  const [rejecting, setRejecting] = React.useState<EcosystemEntity | null>(null);
  const [reason, setReason] = React.useState("");

  function approve(entity: EcosystemEntity) {
    decideEcosystemEntity(entity.id, "Disetujui", "Anda (Petugas Admin)");
    showToast(`${entity.name} telah disetujui dan terdaftar pada ekosistem.`);
  }

  function confirmReject() {
    if (!rejecting || !reason.trim()) return;
    decideEcosystemEntity(rejecting.id, "Ditolak", "Anda (Petugas Admin)", reason.trim());
    showToast(`Pendaftaran ${rejecting.name} ditolak.`);
    setRejecting(null);
    setReason("");
  }

  return (
    <div>
      <PageHeader
        title="Persetujuan Pendaftaran"
        description="Tinjau dan putuskan pendaftaran entitas ekosistem baru (Platform/Pialang, Bursa, Kliring, Asosiasi) sebelum terdaftar aktif di sistem."
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Entitas</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Nomor Izin</TableHead>
            <TableHead>Diajukan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pending.map((e) => (
            <TableRow key={e.id}>
              <TableCell className="font-medium text-navy">{e.name}</TableCell>
              <TableCell>{e.category}</TableCell>
              <TableCell className="whitespace-nowrap">{e.license || "-"}</TableCell>
              <TableCell className="whitespace-nowrap">{e.registeredAt}</TableCell>
              <TableCell><Badge variant="amber">MENUNGGU PERSETUJUAN</Badge></TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <Button size="sm" variant="success" onClick={() => approve(e)}>
                    <CheckCircle2 className="size-3.5" /> Setujui
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => setRejecting(e)}>
                    <XCircle className="size-3.5" /> Tolak
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {pending.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted py-6">
                Tidak ada pendaftaran yang menunggu persetujuan.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={!!rejecting} onOpenChange={(v) => { if (!v) { setRejecting(null); setReason(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Pendaftaran</DialogTitle>
            <DialogDescription>Tolak pendaftaran {rejecting?.name}. Alasan penolakan wajib diisi.</DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="reject-reason">Alasan Penolakan</Label>
            <Textarea id="reject-reason" value={reason} onChange={(e) => setReason(e.target.value)} className="min-h-[70px] text-xs" />
          </div>
          <DialogFooter>
            <Button size="sm" variant="secondary" onClick={() => setRejecting(null)}>Batal</Button>
            <Button size="sm" variant="destructive" disabled={!reason.trim()} onClick={confirmReject}>Konfirmasi Tolak</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
