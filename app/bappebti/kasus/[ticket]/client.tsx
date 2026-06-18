"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  SeverityBadge,
  OwnerBadge,
  ResponsibilityBadge,
  SlaBadge,
} from "@/components/shared/badges";
import { CaseTimeline } from "@/components/shared/timeline";
import { useToast } from "@/components/shared/toast-provider";
import { getCaseByTicket, formatCurrency } from "@/lib/mock-data";
import { TimelineEvent, OwnerType } from "@/lib/types";
import { ArrowRight, FileText } from "lucide-react";

const OWNER_OPTIONS: OwnerType[] = ["Pelapor", "Platform", "Bursa", "Kliring", "Bappebti"];

export default function KasusDetailClient({ ticket }: { ticket: string }) {
  const c = getCaseByTicket(ticket);
  const { showToast } = useToast();

  const [notes, setNotes] = useState<TimelineEvent[]>(c ? c.timeline : []);
  const [noteText, setNoteText] = useState("");
  const [reassignTarget, setReassignTarget] = useState<OwnerType>("Bappebti");
  const [showReassign, setShowReassign] = useState(false);
  const [closed, setClosed] = useState(c?.status === "Selesai");

  if (!c) {
    return (
      <div>
        <PageHeader title="Kasus Tidak Ditemukan" />
        <Card>
          <CardContent className="text-sm text-muted py-6 text-center">
            Kasus dengan tiket <span className="font-medium text-foreground">{ticket}</span> tidak ditemukan.
            <div className="mt-3">
              <Link href="/bappebti/kasus">
                <Button variant="secondary" size="sm">
                  Kembali ke Daftar Kasus
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  function nowDatetime() {
    return new Date().toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function addAuditEntry(action: string, note: string, status: TimelineEvent["status"] = "info") {
    setNotes((prev) => [
      ...prev,
      {
        datetime: nowDatetime(),
        actor: "Tim Bappebti",
        role: "Bappebti",
        action,
        note,
        status,
      },
    ]);
  }

  function handleAddNote() {
    if (!noteText.trim()) return;
    addAuditEntry("Catatan internal ditambahkan", noteText.trim(), "info");
    setNoteText("");
    showToast("Catatan Bappebti berhasil ditambahkan");
  }

  function handleReassign() {
    addAuditEntry(
      "Current owner ditugaskan ulang",
      `Current owner kasus dipindahkan ke ${reassignTarget}.`,
      "info"
    );
    setShowReassign(false);
    showToast(`Current owner berhasil ditugaskan ulang ke ${reassignTarget}`);
  }

  function handleAddRelatedPlatform() {
    addAuditEntry(
      "Platform terkait ditambahkan",
      "Platform terkait baru ditambahkan ke kasus untuk koordinasi penyelesaian.",
      "info"
    );
    showToast("Platform terkait berhasil ditambahkan ke kasus");
  }

  function handleRequestClarification() {
    addAuditEntry(
      "Permintaan klarifikasi dikirim",
      "Bappebti meminta klarifikasi tambahan kepada pelapor.",
      "warning"
    );
    showToast("Permintaan klarifikasi telah dikirim kepada pelapor");
  }

  function handleRequestMemberExplanation() {
    addAuditEntry(
      "Permintaan penjelasan anggota dikirim",
      "Bappebti meminta penjelasan resmi dari anggota terkait penanganan kasus ini.",
      "warning"
    );
    showToast("Permintaan penjelasan telah dikirim kepada anggota");
  }

  function handleApproveSlaExtension() {
    addAuditEntry(
      "Perpanjangan SLA disetujui",
      "Batas waktu SLA kasus diperpanjang atas persetujuan Bappebti.",
      "warning"
    );
    showToast("Perpanjangan SLA telah disetujui");
  }

  function handleTakeOver() {
    addAuditEntry(
      "Kasus diambil alih Bappebti",
      "Kasus diambil alih dan diklasifikasikan sebagai BAPPEBTI OWNED.",
      "danger"
    );
    showToast("Kasus berhasil diambil alih sebagai Bappebti-owned");
  }

  function handleEscalateEnforcement() {
    addAuditEntry(
      "Eskalasi ke Penegakan",
      "Kasus dieskalasi ke unit Penegakan untuk investigasi lebih lanjut.",
      "danger"
    );
    showToast("Kasus berhasil dieskalasi ke unit Penegakan");
  }

  function handleValidateResolution() {
    addAuditEntry(
      "Resolusi divalidasi",
      "Resolusi yang diajukan telah divalidasi oleh Bappebti.",
      "success"
    );
    showToast("Resolusi kasus berhasil divalidasi");
  }

  function handleToggleClose() {
    if (closed) {
      addAuditEntry("Kasus dibuka kembali", "Kasus dibuka kembali untuk peninjauan lanjutan.", "warning");
      setClosed(false);
      showToast("Kasus berhasil dibuka kembali");
    } else {
      addAuditEntry("Kasus ditutup", "Kasus dinyatakan selesai dan ditutup oleh Bappebti.", "success");
      setClosed(true);
      showToast("Kasus berhasil ditutup");
    }
  }

  const platformResponses = c.timeline.filter((t) => ["Platform", "Bursa", "Kliring"].includes(t.role));
  const bappebtiNotes = notes.filter((t) => t.role === "Bappebti");

  return (
    <div>
      <PageHeader
        title={`${c.ticket} — ${c.title}`}
        description="Tampilan regulator atas detail pengaduan, riwayat penanganan, dan tindakan pengawasan yang tersedia."
        actions={
          <Link href="/bappebti/kasus">
            <Button variant="secondary" size="sm">
              Kembali ke Daftar
            </Button>
          </Link>
        }
      />

      {/* Header info */}
      <Card className="mb-4">
        <CardContent className="py-3 flex flex-wrap items-center gap-2">
          <SeverityBadge severity={c.severity} />
          <OwnerBadge owner={c.currentOwner} />
          <ResponsibilityBadge responsibility={c.responsibility} />
          <SlaBadge sla={c.slaStatus} />
          <span className="text-xs text-muted">
            Batas Waktu SLA: <span className="font-medium text-foreground">{c.slaDeadline}</span>
          </span>
          <span className="ml-auto text-xs text-muted">
            Platform: <span className="font-medium text-foreground">{c.platform}</span>
          </span>
        </CardContent>
      </Card>

      <p className="text-[11px] text-muted mb-4">
        Pelapor: <span className="font-medium text-foreground">{c.reporterName}</span> (identitas
        lengkap disamarkan demi kepatuhan privasi data)
      </p>

      {/* Tabs */}
      <Tabs defaultValue="ringkasan">
        <TabsList>
          <TabsTrigger value="ringkasan">Ringkasan Pengaduan</TabsTrigger>
          <TabsTrigger value="bukti">Bukti</TabsTrigger>
          <TabsTrigger value="respons">Respons Anggota</TabsTrigger>
          <TabsTrigger value="catatan">Catatan Bappebti</TabsTrigger>
          <TabsTrigger value="resolusi">Resolusi</TabsTrigger>
          <TabsTrigger value="terkait">Kasus Terkait</TabsTrigger>
        </TabsList>

        <TabsContent value="ringkasan">
          <Card>
            <CardContent className="py-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[11px] uppercase text-muted font-medium mb-1">Kategori</p>
                <p>{c.category}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase text-muted font-medium mb-1">Subkategori</p>
                <p>{c.subcategory}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase text-muted font-medium mb-1">Nilai Transaksi</p>
                <p>{formatCurrency(c.amount)}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase text-muted font-medium mb-1">Referensi Transaksi</p>
                <p>{c.transactionRef || "-"}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase text-muted font-medium mb-1">ID Pengguna Platform</p>
                <p>{c.platformUserId || "-"}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-[11px] uppercase text-muted font-medium mb-1">Kronologi</p>
                <p className="text-foreground/90">{c.chronology}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-[11px] uppercase text-muted font-medium mb-1">Penyelesaian yang Diharapkan</p>
                <p className="text-foreground/90">{c.expectedResolution}</p>
              </div>
              {c.escalationReason && (
                <div className="sm:col-span-2">
                  <p className="text-[11px] uppercase text-muted font-medium mb-1">Alasan Eskalasi</p>
                  <p className="text-foreground/90">{c.escalationReason}</p>
                </div>
              )}
              {c.reconciliationIssue && (
                <div className="sm:col-span-2">
                  <p className="text-[11px] uppercase text-muted font-medium mb-1">Isu Rekonsiliasi</p>
                  <p className="text-foreground/90">{c.reconciliationIssue}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bukti">
          <Card>
            <CardContent className="py-4">
              {c.evidences.length === 0 ? (
                <p className="text-sm text-muted">Tidak ada bukti yang dilampirkan.</p>
              ) : (
                <ul className="space-y-2">
                  {c.evidences.map((ev, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm rounded-md border border-border px-3 py-2">
                      <FileText className="size-4 text-navy" />
                      <span>{ev}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="respons">
          <Card>
            <CardHeader>
              <CardTitle>Klarifikasi</CardTitle>
            </CardHeader>
            <CardContent className="py-4 space-y-3">
              {c.clarifications.length === 0 && (
                <p className="text-sm text-muted">Belum ada klarifikasi.</p>
              )}
              {c.clarifications.map((cl, idx) => (
                <div key={idx} className="rounded-md border border-border px-3 py-2 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{cl.from}</span>
                    <span className="text-[11px] text-muted">{cl.datetime}</span>
                  </div>
                  <p className="text-[11px] text-muted mb-1">{cl.role}</p>
                  <p>{cl.message}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Narasi Respons Anggota</CardTitle>
            </CardHeader>
            <CardContent className="py-4 space-y-3">
              {platformResponses.length === 0 && (
                <p className="text-sm text-muted">Belum ada respons dari anggota (platform/bursa/kliring).</p>
              )}
              {platformResponses.map((t, idx) => (
                <div key={idx} className="rounded-md border border-border px-3 py-2 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{t.actor}</span>
                    <span className="text-[11px] text-muted">{t.datetime}</span>
                  </div>
                  <p className="text-[11px] text-muted mb-1">{t.role} &middot; {t.action}</p>
                  <p>{t.note}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="catatan">
          <Card>
            <CardHeader>
              <CardTitle>Catatan Internal Bappebti</CardTitle>
            </CardHeader>
            <CardContent className="py-4 space-y-3">
              {bappebtiNotes.length === 0 && (
                <p className="text-sm text-muted">Belum ada catatan dari Bappebti.</p>
              )}
              {bappebtiNotes.map((t, idx) => (
                <div key={idx} className="rounded-md border border-border px-3 py-2 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{t.actor}</span>
                    <span className="text-[11px] text-muted">{t.datetime}</span>
                  </div>
                  <p className="text-[11px] text-muted mb-1">{t.action}</p>
                  <p>{t.note}</p>
                </div>
              ))}
              <div className="pt-2 space-y-2">
                <Textarea
                  placeholder="Tulis catatan internal Bappebti..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                />
                <Button size="sm" onClick={handleAddNote}>
                  Tambah Catatan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resolusi">
          <Card>
            <CardHeader>
              <CardTitle>Resolusi</CardTitle>
            </CardHeader>
            <CardContent className="py-4">
              {c.resolutionProposal ? (
                <p className="text-sm">{c.resolutionProposal}</p>
              ) : (
                <p className="text-sm text-muted">Belum ada resolusi diajukan.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="terkait">
          <Card>
            <CardHeader>
              <CardTitle>Kasus Terkait</CardTitle>
            </CardHeader>
            <CardContent className="py-4">
              {!c.relatedCases || c.relatedCases.length === 0 ? (
                <p className="text-sm text-muted">Tidak ada kasus terkait.</p>
              ) : (
                <ul className="space-y-2">
                  {c.relatedCases.map((rt) => (
                    <li key={rt}>
                      <Link
                        href={`/bappebti/kasus/${rt}`}
                        className="text-navy inline-flex items-center gap-1 hover:underline text-sm"
                      >
                        {rt} <ArrowRight className="size-3" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Audit trail */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Jejak Audit</CardTitle>
        </CardHeader>
        <CardContent className="py-4">
          <CaseTimeline events={notes} />
        </CardContent>
      </Card>

      {/* Regulator actions */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Tindakan Regulator</CardTitle>
        </CardHeader>
        <CardContent className="py-4 space-y-3">
          {showReassign && (
            <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-muted-bg/50 px-3 py-2">
              <span className="text-xs text-muted">Tugaskan ulang current owner ke:</span>
              <Select
                className="w-48"
                value={reassignTarget}
                onChange={(e) => setReassignTarget(e.target.value as OwnerType)}
              >
                {OWNER_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </Select>
              <Button size="sm" onClick={handleReassign}>
                Konfirmasi
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowReassign(false)}>
                Batal
              </Button>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowReassign((v) => !v)}>
              Tugaskan Ulang Current Owner
            </Button>
            <Button variant="secondary" size="sm" onClick={handleAddRelatedPlatform}>
              Tambah Platform Terkait
            </Button>
            <Button variant="secondary" size="sm" onClick={handleRequestClarification}>
              Minta Klarifikasi
            </Button>
            <Button variant="secondary" size="sm" onClick={handleRequestMemberExplanation}>
              Minta Penjelasan Anggota
            </Button>
            <Button variant="secondary" size="sm" onClick={handleApproveSlaExtension}>
              Setujui Perpanjangan SLA
            </Button>
            <Button variant="secondary" size="sm" onClick={handleTakeOver}>
              Ambil Alih sebagai Bappebti-Owned
            </Button>
            <Button variant="destructive" size="sm" onClick={handleEscalateEnforcement}>
              Eskalasi ke Penegakan
            </Button>
            <Button variant="success" size="sm" onClick={handleValidateResolution}>
              Validasi Resolusi
            </Button>
            <Button variant={closed ? "secondary" : "outline"} size="sm" onClick={handleToggleClose}>
              {closed ? "Buka Kembali Kasus" : "Tutup Kasus"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
