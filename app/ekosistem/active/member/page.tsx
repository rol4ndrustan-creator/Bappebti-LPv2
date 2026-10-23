"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { EKOSISTEM_ACTIVE_MEMBERS } from "@/lib/mock-data";
import { useEcosystemActiveMembers } from "@/lib/mock-service/ecosystem-member-store";
import { EcosystemActiveMember } from "@/lib/types";
import { Eye } from "lucide-react";

export default function EkosistemActiveMemberPage() {
  const members = useEcosystemActiveMembers(EKOSISTEM_ACTIVE_MEMBERS);
  const [viewing, setViewing] = useState<EcosystemActiveMember | null>(null);

  return (
    <div>
      <PageHeader
        title="Data Member"
        description="Direktori informatif anggota infrastruktur pasar (Bursa, Kliring, Custody). Dikelola terpusat oleh Bappebti melalui Management Member."
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kode Entitas</TableHead>
            <TableHead>Nama Lembaga</TableHead>
            <TableHead>Tipe Ekosistem</TableHead>
            <TableHead>No. Izin / SK Bappebti</TableHead>
            <TableHead>Tanggal Terdaftar</TableHead>
            <TableHead>PIC Operasional</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((m) => (
            <TableRow key={m.id}>
              <TableCell className="font-medium text-navy whitespace-nowrap">{m.id}</TableCell>
              <TableCell className="max-w-[220px] truncate">{m.name}</TableCell>
              <TableCell className="text-muted whitespace-nowrap">{m.memberType}</TableCell>
              <TableCell className="text-muted whitespace-nowrap">{m.license}</TableCell>
              <TableCell className="text-muted whitespace-nowrap">{m.registeredAt}</TableCell>
              <TableCell className="text-muted whitespace-nowrap">{m.picName}</TableCell>
              <TableCell>
                <Badge variant={m.status === "Aktif" ? "green" : "muted"}>{m.status}</Badge>
              </TableCell>
              <TableCell>
                <button
                  title="Lihat Detail"
                  onClick={() => setViewing(m)}
                  className="rounded p-1 text-muted hover:bg-muted-bg hover:text-navy"
                >
                  <Eye className="size-3.5" />
                </button>
              </TableCell>
            </TableRow>
          ))}
          {members.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted py-6">
                Belum ada member terdaftar.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={!!viewing} onOpenChange={(v) => !v && setViewing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewing?.name}</DialogTitle>
            <DialogDescription>Kode Entitas: {viewing?.id}</DialogDescription>
          </DialogHeader>
          {viewing && (
            <dl className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="text-muted">Tipe Ekosistem</dt>
                <dd className="font-medium mt-0.5">{viewing.memberType}</dd>
              </div>
              <div>
                <dt className="text-muted">Status</dt>
                <dd className="mt-0.5"><Badge variant={viewing.status === "Aktif" ? "green" : "muted"}>{viewing.status}</Badge></dd>
              </div>
              <div>
                <dt className="text-muted">No. Izin / SK Bappebti</dt>
                <dd className="font-medium mt-0.5">{viewing.license}</dd>
              </div>
              <div>
                <dt className="text-muted">Tanggal Terdaftar</dt>
                <dd className="font-medium mt-0.5">{viewing.registeredAt}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted">PIC Operasional</dt>
                <dd className="font-medium mt-0.5">{viewing.picName} &middot; {viewing.picEmail}</dd>
              </div>
            </dl>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
