"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge, SlaBadge } from "@/components/shared/badges";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CASES, formatCurrency } from "@/lib/mock-data";
import { CaseStatus, ComplaintCase } from "@/lib/types";
import { useToast } from "@/components/shared/toast-provider";
import { useDemoSession } from "@/lib/demo-session";
import { useCasesData, setPlatformPic } from "@/lib/mock-service/store";
import { PLATFORM_STAFF } from "@/lib/permissions";
import { UserCog } from "lucide-react";

const UNASSIGNED = "Belum Ditugaskan";

function actionRequired(status: CaseStatus): string {
  switch (status) {
    case "Baru":
      return "Verifikasi awal kasus";
    case "Verifikasi":
      return "Mulai investigasi";
    case "Diproses":
      return "Tunggu konfirmasi bank / lanjutkan investigasi";
    case "Menunggu Klarifikasi":
      return "Tunggu respon klarifikasi pelapor";
    case "Resolusi Diajukan":
      return "Menunggu konfirmasi pelapor";
    case "Selesai":
      return "Tidak ada tindakan lanjutan";
    case "Ditolak":
      return "Tinjau ulang penolakan";
    default:
      return "Tinjau kasus";
  }
}

export default function CaseQueuePage() {
  const { showToast } = useToast();
  const { user } = useDemoSession();
  const isSupervisor = user.role === "PLATFORM_SUPERVISOR";
  const baseCases = useMemo(() => CASES.filter((c) => c.currentOwner === "Platform"), []);
  const allCases = useCasesData(baseCases).filter((c) => c.currentOwner === "Platform");

  // Data scoping (Bab II): a CS/PIC only ever sees tickets assigned to them.
  const scopedCases = isSupervisor ? allCases : allCases.filter((c) => c.platformPic === user.name);

  const [search, setSearch] = useState("");
  const [picFilter, setPicFilter] = useState("");
  const [assigning, setAssigning] = useState<ComplaintCase | null>(null);
  const [assigneeDraft, setAssigneeDraft] = useState("");

  const cases = scopedCases.filter((c) => {
    const matchesSearch = !search || c.ticket.toLowerCase().includes(search.toLowerCase()) || c.title.toLowerCase().includes(search.toLowerCase());
    const matchesPic = !picFilter || (picFilter === UNASSIGNED ? !c.platformPic : c.platformPic === picFilter);
    return matchesSearch && matchesPic;
  });

  function openAssign(c: ComplaintCase) {
    setAssigning(c);
    setAssigneeDraft(c.platformPic ?? "");
  }

  function confirmAssign() {
    if (!assigning) return;
    setPlatformPic(assigning.ticket, assigneeDraft);
    showToast(assigneeDraft ? `${assigning.ticket} ditugaskan ke ${assigneeDraft}.` : `Penugasan ${assigning.ticket} dibatalkan.`);
    setAssigning(null);
  }

  return (
    <div>
      <PageHeader
        title="Case Queue"
        description="Daftar kasus pengaduan yang saat ini menjadi tanggung jawab Platform / Pialang untuk ditangani."
      />

      <div className="mb-3 flex flex-wrap items-end gap-2">
        <div className="w-full max-w-xs">
          <Label>Cari</Label>
          <Input placeholder="Nomor tiket atau judul..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {isSupervisor && (
          <div className="w-56">
            <Label>PIC</Label>
            <Select value={picFilter} onChange={(e) => setPicFilter(e.target.value)}>
              <option value="">Semua PIC</option>
              <option value={UNASSIGNED}>{UNASSIGNED}</option>
              {PLATFORM_STAFF.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </Select>
          </div>
        )}
        {(search || picFilter) && (
          <Button variant="secondary" size="sm" onClick={() => { setSearch(""); setPicFilter(""); }}>
            Reset Filter
          </Button>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tiket</TableHead>
            <TableHead>Pengaduan</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>SLA</TableHead>
            <TableHead>PIC</TableHead>
            <TableHead>Tindakan Diperlukan</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases.map((c) => (
            <TableRow key={c.ticket}>
              <TableCell className="font-medium text-navy">{c.ticket}</TableCell>
              <TableCell className="max-w-[220px] truncate">{c.title}</TableCell>
              <TableCell className="text-muted">{c.category}</TableCell>
              <TableCell><StatusBadge status={c.status} /></TableCell>
              <TableCell><SlaBadge sla={c.slaStatus} /></TableCell>
              <TableCell className="text-muted whitespace-nowrap">{c.platformPic || UNASSIGNED}</TableCell>
              <TableCell className="text-muted">{actionRequired(c.status)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <Link href={`/platform/kasus/${c.ticket}`}>
                    <Button variant="outline" size="sm">Kelola</Button>
                  </Link>
                  {isSupervisor && (
                    <Button variant="ghost" size="sm" onClick={() => openAssign(c)}>
                      <UserCog className="size-3.5" /> Assign PIC
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
          {cases.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted py-6">
                {isSupervisor ? "Tidak ada kasus yang sesuai dengan filter." : "Tidak ada tiket yang ditugaskan kepada Anda."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={!!assigning} onOpenChange={(v) => !v && setAssigning(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign PIC</DialogTitle>
            <DialogDescription>
              {assigning?.ticket} — {assigning?.title}. Total nilai transaksi: {formatCurrency(assigning?.amount)}.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="assign-pic-select">Petugas (PIC)</Label>
            <Select id="assign-pic-select" value={assigneeDraft} onChange={(e) => setAssigneeDraft(e.target.value)}>
              <option value="">{UNASSIGNED}</option>
              {PLATFORM_STAFF.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </Select>
          </div>
          <DialogFooter>
            <Button size="sm" variant="secondary" onClick={() => setAssigning(null)}>Batal</Button>
            <Button size="sm" onClick={confirmAssign}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
