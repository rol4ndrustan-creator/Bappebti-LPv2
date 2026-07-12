"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge, SlaBadge } from "@/components/shared/badges";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CASES, formatCurrency } from "@/lib/mock-data";
import { CaseStatus } from "@/lib/types";
import { useToast } from "@/components/shared/toast-provider";
import { useDemoSession } from "@/lib/demo-session";
import { useMergedCases, proposeResolution, reassignOwner } from "@/lib/mock-service/store";
import { ChevronDown, ChevronUp } from "lucide-react";

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
  const baseCases = useMemo(() => CASES.filter((c) => c.currentOwner === "Platform"), []);
  const cases = useMergedCases(baseCases).filter((c) => c.currentOwner === "Platform");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [clarificationText, setClarificationText] = useState("");
  const [resolutionText, setResolutionText] = useState("");

  function toggleExpand(ticket: string) {
    setExpanded((prev) => (prev === ticket ? null : ticket));
    setNoteText("");
    setClarificationText("");
    setResolutionText("");
  }

  function handleAddNote(ticket: string) {
    if (!noteText.trim()) {
      showToast("Catatan investigasi tidak boleh kosong.");
      return;
    }
    showToast(`Catatan investigasi untuk ${ticket} berhasil disimpan.`);
    setNoteText("");
  }

  function handleRequestClarification(ticket: string) {
    if (!clarificationText.trim()) {
      showToast("Pesan klarifikasi tidak boleh kosong.");
      return;
    }
    showToast(`Permintaan klarifikasi untuk ${ticket} telah dikirim ke pelapor.`);
    setClarificationText("");
  }

  function handleUploadEvidence(ticket: string) {
    showToast(`Bukti penanganan untuk ${ticket} berhasil diunggah (demo).`);
  }

  function handleProposeResolution(ticket: string) {
    if (!resolutionText.trim()) {
      showToast("Usulan resolusi tidak boleh kosong.");
      return;
    }
    proposeResolution(ticket, resolutionText, user.name, "Platform");
    showToast(`Usulan resolusi untuk ${ticket} telah diajukan kepada pelapor dan tercatat di Bappebti.`);
    setResolutionText("");
  }

  function handleEscalate(ticket: string) {
    const target = cases.find((c) => c.ticket === ticket);
    reassignOwner(
      ticket,
      "Bappebti",
      "Kasus dieskalasi oleh platform ke Bappebti untuk supervisi lebih lanjut.",
      user.name,
      "Platform",
      { severity: target?.severity ?? "Sedang", slaStatus: target?.slaStatus ?? "Aman" }
    );
    showToast("Kasus dieskalasi ke Bappebti");
  }

  return (
    <div>
      <PageHeader
        title="Case Queue"
        description="Daftar kasus pengaduan yang saat ini menjadi tanggung jawab Platform / Pialang untuk ditangani."
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tiket</TableHead>
            <TableHead>Pengaduan</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>SLA</TableHead>
            <TableHead>Tindakan Diperlukan</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases.map((c) => (
            <>
              <TableRow key={c.ticket}>
                <TableCell className="font-medium text-navy">{c.ticket}</TableCell>
                <TableCell className="max-w-[220px] truncate">{c.title}</TableCell>
                <TableCell className="text-muted">{c.category}</TableCell>
                <TableCell><StatusBadge status={c.status} /></TableCell>
                <TableCell><SlaBadge sla={c.slaStatus} /></TableCell>
                <TableCell className="text-muted">{actionRequired(c.status)}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => toggleExpand(c.ticket)}>
                    Kelola
                    {expanded === c.ticket ? (
                      <ChevronUp className="size-3.5" />
                    ) : (
                      <ChevronDown className="size-3.5" />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
              {expanded === c.ticket && (
                <TableRow key={`${c.ticket}-detail`}>
                  <TableCell colSpan={7} className="bg-muted-bg/50">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 py-2">
                      <div>
                        <h4 className="text-xs font-semibold text-navy mb-2">Kronologi Kasus</h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                          {c.timeline.map((t, i) => (
                            <div key={i} className="rounded-md border border-border bg-white p-2">
                              <div className="flex items-center justify-between text-[11px] text-muted">
                                <span>{t.datetime}</span>
                                <span>{t.role}</span>
                              </div>
                              <p className="text-xs font-medium mt-0.5">{t.action}</p>
                              <p className="text-xs text-muted mt-0.5">{t.note}</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted">Pelapor: </span>
                            {c.reporterName}
                          </div>
                          <div>
                            <span className="text-muted">Nominal: </span>
                            {formatCurrency(c.amount)}
                          </div>
                          <div className="col-span-2">
                            <span className="text-muted">Resolusi yang diharapkan: </span>
                            {c.expectedResolution}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h4 className="text-xs font-semibold text-navy mb-1">Tambah Catatan Investigasi</h4>
                          <Textarea
                            placeholder="Tulis catatan investigasi..."
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            className="text-xs min-h-[60px]"
                          />
                          <Button size="sm" className="mt-1" onClick={() => handleAddNote(c.ticket)}>
                            Simpan Catatan
                          </Button>
                        </div>

                        <div>
                          <h4 className="text-xs font-semibold text-navy mb-1">Minta Klarifikasi ke Pelapor</h4>
                          <Textarea
                            placeholder="Tulis permintaan klarifikasi..."
                            value={clarificationText}
                            onChange={(e) => setClarificationText(e.target.value)}
                            className="text-xs min-h-[60px]"
                          />
                          <Button size="sm" variant="secondary" className="mt-1" onClick={() => handleRequestClarification(c.ticket)}>
                            Kirim Permintaan Klarifikasi
                          </Button>
                        </div>

                        <div>
                          <h4 className="text-xs font-semibold text-navy mb-1">Usulkan Resolusi</h4>
                          <Textarea
                            placeholder="Tulis usulan resolusi..."
                            value={resolutionText}
                            onChange={(e) => setResolutionText(e.target.value)}
                            className="text-xs min-h-[60px]"
                          />
                          <Button size="sm" variant="success" className="mt-1" onClick={() => handleProposeResolution(c.ticket)}>
                            Ajukan Resolusi
                          </Button>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <Button size="sm" variant="outline" onClick={() => handleUploadEvidence(c.ticket)}>
                            Unggah Bukti Penanganan
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleEscalate(c.ticket)}>
                            Eskalasi ke Bappebti
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
