"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { EKOSISTEM_PENGAWAS_MEMBERS } from "@/lib/mock-data";
import { useEcosystemPengawasMembers } from "@/lib/mock-service/ecosystem-member-store";
import { EcosystemPengawasMember, EcosystemPengawasMembershipStatus } from "@/lib/types";
import { Eye } from "lucide-react";

const STATUS_VARIANT: Record<EcosystemPengawasMembershipStatus, "green" | "amber" | "muted"> = {
  Aktif: "green",
  Suspended: "amber",
  "Non-Aktif": "muted",
};

export default function EkosistemPengawasMemberPage() {
  const members = useEcosystemPengawasMembers(EKOSISTEM_PENGAWAS_MEMBERS);
  const [viewing, setViewing] = useState<EcosystemPengawasMember | null>(null);

  return (
    <div>
      <PageHeader
        title="Data Member"
        description="Direktori informatif anggota pelaku usaha di bawah ASPEBTINDO & BAKTI. Dikelola terpusat oleh Bappebti melalui Management Member."
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kode Anggota</TableHead>
            <TableHead>Nama Perusahaan</TableHead>
            <TableHead>Lembaga</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>No. Izin Bappebti</TableHead>
            <TableHead>Tanggal Bergabung</TableHead>
            <TableHead>Contact Person</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((m) => (
            <TableRow key={m.id}>
              <TableCell className="font-medium text-navy whitespace-nowrap">{m.id}</TableCell>
              <TableCell className="max-w-[200px] truncate">{m.companyName}</TableCell>
              <TableCell className="text-muted whitespace-nowrap">{m.association}</TableCell>
              <TableCell className="text-muted whitespace-nowrap">{m.category}</TableCell>
              <TableCell className="text-muted whitespace-nowrap">{m.license}</TableCell>
              <TableCell className="text-muted whitespace-nowrap">{m.joinedAt}</TableCell>
              <TableCell className="text-muted max-w-[180px] truncate">{m.picName}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[m.status]}>{m.status}</Badge>
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
              <TableCell colSpan={9} className="text-center text-muted py-6">
                Belum ada member terdaftar.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={!!viewing} onOpenChange={(v) => !v && setViewing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewing?.companyName}</DialogTitle>
            <DialogDescription>Kode Anggota: {viewing?.id} &middot; {viewing?.association}</DialogDescription>
          </DialogHeader>
          {viewing && (
            <dl className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="text-muted">Kategori Pelaku Usaha</dt>
                <dd className="font-medium mt-0.5">{viewing.category}</dd>
              </div>
              <div>
                <dt className="text-muted">Status Keanggotaan</dt>
                <dd className="mt-0.5"><Badge variant={STATUS_VARIANT[viewing.status]}>{viewing.status}</Badge></dd>
              </div>
              <div>
                <dt className="text-muted">No. Izin Bappebti</dt>
                <dd className="font-medium mt-0.5">{viewing.license}</dd>
              </div>
              <div>
                <dt className="text-muted">Tanggal Bergabung</dt>
                <dd className="font-medium mt-0.5">{viewing.joinedAt}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted">Contact Person (PIC Compliance)</dt>
                <dd className="font-medium mt-0.5">{viewing.picName} &middot; {viewing.picContact}</dd>
              </div>
            </dl>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
