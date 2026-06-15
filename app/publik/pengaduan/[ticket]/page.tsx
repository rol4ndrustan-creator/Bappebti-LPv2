"use client";

import { use, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  StatusBadge,
  OwnerBadge,
  SlaBadge,
  SeverityBadge,
} from "@/components/shared/badges";
import { CaseTimeline } from "@/components/shared/timeline";
import { useToast } from "@/components/shared/toast-provider";
import { getCaseByTicket, formatCurrency } from "@/lib/mock-data";
import { ClarificationMessage, TimelineEvent } from "@/lib/types";
import {
  FileText,
  Upload,
  MessageSquare,
  ArrowUpCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function PengaduanDetailPage({
  params,
}: {
  params: Promise<{ ticket: string }>;
}) {
  const { ticket } = use(params);
  const c = getCaseByTicket(ticket);
  const { showToast } = useToast();

  const [showUpload, setShowUpload] = useState(false);
  const [showClarificationForm, setShowClarificationForm] = useState(false);
  const [clarificationText, setClarificationText] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const [clarifications, setClarifications] = useState<ClarificationMessage[]>(
    c ? c.clarifications : []
  );
  const [timeline, setTimeline] = useState<TimelineEvent[]>(c ? c.timeline : []);

  if (!c) {
    return (
      <div>
        <PageHeader title="Tiket Tidak Ditemukan" />
        <Card>
          <CardContent className="text-sm text-muted py-6 text-center">
            Tiket dengan nomor <span className="font-medium text-foreground">{ticket}</span> tidak
            ditemukan.
            <div className="mt-3">
              <Link href="/publik/pengaduan">
                <Button variant="secondary" size="sm">
                  Kembali ke Daftar Pengaduan
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isResolutionStage = c.status === "Resolusi Diajukan";

  function handleSendClarification() {
    if (!clarificationText.trim()) return;
    const now = new Date();
    const datetime = now.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    setClarifications((prev) => [
      ...prev,
      {
        from: c!.reporterName,
        role: "Pelapor",
        datetime,
        message: clarificationText.trim(),
      },
    ]);
    setClarificationText("");
    setShowClarificationForm(false);
    showToast("Jawaban klarifikasi telah dikirim.");
  }

  function handleEscalate() {
    const now = new Date();
    const datetime = now.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    setTimeline((prev) => [
      ...prev,
      {
        datetime,
        actor: c!.reporterName,
        role: "Pelapor",
        action: "Permintaan eskalasi diajukan",
        note: "Pelapor mengajukan permintaan eskalasi penanganan kasus kepada Bappebti.",
        status: "warning",
      },
    ]);
    showToast("Permintaan eskalasi telah dikirim ke Bappebti");
  }

  function handleAcceptResolution() {
    showToast("Resolusi diterima, kasus akan ditutup");
  }

  function handleRejectResolution() {
    if (!rejectReason.trim()) return;
    setRejectReason("");
    setShowRejectForm(false);
    showToast("Penolakan resolusi telah dikirim beserta alasan Anda");
  }

  return (
    <div>
      <PageHeader
        title={`${c.ticket} — ${c.title}`}
        description="Detail pengaduan, riwayat penanganan, dan tindakan yang tersedia."
        actions={
          <Link href="/publik/pengaduan">
            <Button variant="secondary" size="sm">
              Kembali ke Daftar
            </Button>
          </Link>
        }
      />

      {/* Header info */}
      <Card className="mb-4">
        <CardContent className="py-3 flex flex-wrap items-center gap-2">
          <StatusBadge status={c.status} />
          <OwnerBadge owner={c.currentOwner} />
          <SeverityBadge severity={c.severity} />
          <SlaBadge sla={c.slaStatus} />
          <span className="ml-auto text-xs text-muted">
            Estimasi/Batas Waktu SLA: <span className="font-medium text-foreground">{c.slaDeadline}</span>
          </span>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Pengaduan</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <dt className="text-muted">Kategori</dt>
                  <dd className="font-medium">{c.category}</dd>
                </div>
                <div>
                  <dt className="text-muted">Subkategori</dt>
                  <dd className="font-medium">{c.subcategory}</dd>
                </div>
                <div>
                  <dt className="text-muted">Platform</dt>
                  <dd className="font-medium">{c.platform}</dd>
                </div>
                <div>
                  <dt className="text-muted">Platform User ID</dt>
                  <dd className="font-medium">{c.platformUserId || "-"}</dd>
                </div>
                <div>
                  <dt className="text-muted">Nomor Transaksi/Referensi</dt>
                  <dd className="font-medium">{c.transactionRef || "-"}</dd>
                </div>
                <div>
                  <dt className="text-muted">Nilai Transaksi</dt>
                  <dd className="font-medium">{formatCurrency(c.amount)}</dd>
                </div>
                <div>
                  <dt className="text-muted">Tanggal Dibuat</dt>
                  <dd className="font-medium">{c.createdAt}</dd>
                </div>
                <div>
                  <dt className="text-muted">Update Terakhir</dt>
                  <dd className="font-medium">{c.updatedAt}</dd>
                </div>
              </dl>
              <Separator className="my-3" />
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-navy mb-1">Kronologi</p>
                  <p className="text-xs text-foreground/80">{c.chronology}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-navy mb-1">Permintaan Pelapor / Resolusi yang Diharapkan</p>
                  <p className="text-xs text-foreground/80">{c.expectedResolution}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evidence */}
          <Card>
            <CardHeader>
              <CardTitle>Bukti Pendukung</CardTitle>
            </CardHeader>
            <CardContent>
              {c.evidences.length === 0 ? (
                <p className="text-xs text-muted">Belum ada bukti yang diunggah.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {c.evidences.map((file) => (
                    <li key={file} className="flex items-center gap-2 text-xs">
                      <FileText className="size-4 text-navy shrink-0" />
                      <span>{file}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Clarification thread */}
          <Card>
            <CardHeader>
              <CardTitle>Klarifikasi</CardTitle>
            </CardHeader>
            <CardContent>
              {clarifications.length === 0 ? (
                <p className="text-xs text-muted">Belum ada percakapan klarifikasi.</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {clarifications.map((m, idx) => (
                    <li key={idx} className="rounded-md border border-border p-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-navy">
                          {m.from} <span className="text-muted font-normal">&middot; {m.role}</span>
                        </span>
                        <span className="text-[11px] text-muted">{m.datetime}</span>
                      </div>
                      <p className="text-xs text-foreground/80">{m.message}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Penanganan</CardTitle>
            </CardHeader>
            <CardContent>
              <CaseTimeline events={timeline} />
            </CardContent>
          </Card>
        </div>

        {/* Actions sidebar */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Tindakan Tersedia</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {/* Upload evidence */}
              <div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setShowUpload((v) => !v)}
                >
                  <Upload className="size-3.5" />
                  Unggah Bukti Tambahan
                </Button>
                {showUpload && (
                  <div className="mt-2 rounded-md border border-dashed border-border p-3 text-center">
                    <Upload className="size-5 text-muted mx-auto mb-1" />
                    <p className="text-xs text-muted">
                      Seret file ke sini atau klik untuk memilih
                    </p>
                    <p className="text-[11px] text-muted mt-1">
                      PDF, JPG, PNG — maksimal 10MB per file
                    </p>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="mt-2"
                      onClick={() => {
                        setShowUpload(false);
                        showToast("Bukti tambahan berhasil diunggah");
                      }}
                    >
                      Unggah
                    </Button>
                  </div>
                )}
              </div>

              {/* Answer clarification */}
              <div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setShowClarificationForm((v) => !v)}
                >
                  <MessageSquare className="size-3.5" />
                  Jawab Klarifikasi
                </Button>
                {showClarificationForm && (
                  <div className="mt-2 flex flex-col gap-2">
                    <Textarea
                      placeholder="Tulis jawaban klarifikasi Anda..."
                      value={clarificationText}
                      onChange={(e) => setClarificationText(e.target.value)}
                      className="text-xs min-h-[70px]"
                    />
                    <Button size="sm" onClick={handleSendClarification}>
                      Kirim
                    </Button>
                  </div>
                )}
              </div>

              {/* Escalation */}
              <div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start"
                  onClick={handleEscalate}
                >
                  <ArrowUpCircle className="size-3.5" />
                  Ajukan Eskalasi
                </Button>
              </div>

              <Separator />

              {/* Resolution actions */}
              <div className="flex flex-col gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Resolusi Kasus
                </p>
                <Button
                  variant="success"
                  size="sm"
                  className="w-full justify-start"
                  disabled={!isResolutionStage}
                  onClick={handleAcceptResolution}
                >
                  <CheckCircle2 className="size-3.5" />
                  Terima Resolusi
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  disabled={!isResolutionStage}
                  onClick={() => setShowRejectForm((v) => !v)}
                >
                  <XCircle className="size-3.5" />
                  Tolak Resolusi
                </Button>
                {isResolutionStage && showRejectForm && (
                  <div className="flex flex-col gap-2">
                    <Textarea
                      placeholder="Jelaskan alasan penolakan resolusi..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="text-xs min-h-[70px]"
                    />
                    <Button size="sm" variant="destructive" onClick={handleRejectResolution}>
                      Kirim
                    </Button>
                  </div>
                )}
                {!isResolutionStage && (
                  <p className="text-[11px] text-muted">
                    Tindakan terima/tolak resolusi hanya tersedia ketika status kasus adalah
                    &quot;Resolusi Diajukan&quot;.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
