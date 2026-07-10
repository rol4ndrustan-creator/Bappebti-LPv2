"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SeverityBadge } from "@/components/shared/badges";
import { CaseStatusExplanation } from "@/components/shared/case-status-explanation";
import { ResponsibilityPanel } from "@/components/shared/responsibility-panel";
import { SlaSummary } from "@/components/shared/sla-clock-card";
import { EscalationBanner } from "@/components/shared/escalation-banner";
import { ClarificationThread } from "@/components/shared/clarification-thread";
import { EvidenceList } from "@/components/shared/evidence-list";
import { ResolutionPanel } from "@/components/shared/resolution-panel";
import { WorkflowTransitionDialog } from "@/components/shared/workflow-transition-dialog";
import { useToast } from "@/components/shared/toast-provider";
import { useDemoSession } from "@/lib/demo-session";
import { can } from "@/lib/permissions";
import { getCaseByTicket, formatCurrency } from "@/lib/mock-data";
import { getSlaClocks } from "@/lib/workflow-config";
import {
  useCaseData,
  addClarificationReply,
  addInternalNote,
  addTimelineEvent,
  setWorkflowState,
  closeCase,
  reopenCase,
} from "@/lib/mock-service/store";
import { useClarificationsForCase } from "@/lib/mock-service/clarification-store";
import { getClarificationPortalSegment, getViewerRelation } from "@/lib/clarification-workflow";
import { InternalNoteClassification } from "@/lib/types";
import { ArrowRight, FileText, MessageCircle, ShieldAlert } from "lucide-react";

type ActionKind =
  | "request-reporter-info"
  | "request-member-explanation"
  | "escalate-supervisor"
  | "escalate-enforcement"
  | "approve-resolution"
  | "close-resolved"
  | "close-administrative"
  | "reopen";

export default function KasusDetailClient({ ticket }: { ticket: string }) {
  const base = getCaseByTicket(ticket);
  const c = useCaseData(base);
  const { showToast } = useToast();
  const { user } = useDemoSession();
  const clarifications = useClarificationsForCase(ticket);

  const [noteText, setNoteText] = useState("");
  const [noteClass, setNoteClass] = useState<InternalNoteClassification>("Operasional");
  const [activeAction, setActiveAction] = useState<ActionKind | null>(null);

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

  const isBappebtiRole = user.role.startsWith("BAPPEBTI_") || user.role === "SYSTEM_ADMIN";
  const canApprove = can(user.role, "approve_resolution");
  const canClose = can(user.role, "close_case");
  const canReopen = can(user.role, "reopen_case");
  const canEscalate = can(user.role, "escalate_case");
  const canRequestClarification = can(user.role, "request_clarification");

  const memberResponses = c.timeline.filter((t) => ["Platform", "Bursa", "Kliring"].includes(t.role));
  const internalNotes = c.internalNotes ?? [];
  const slaClocks = getSlaClocks(c);

  const viewer = { role: user.role, institution: user.institution };
  const openClarifications = clarifications.filter((cl) => cl.status !== "COMPLETED" && cl.status !== "CANCELLED");
  const clarificationsNeedingAction = openClarifications.filter((cl) => getViewerRelation(cl, viewer) === "actor");
  const latestClarification = [...clarifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

  function runAction(reason: string) {
    switch (activeAction) {
      case "request-reporter-info":
        setWorkflowState(ticket, "WAITING_REPORTER_INFORMATION", "Menunggu Data dari Anda", {
          actor: user.name,
          role: "Bappebti",
          action: "Permintaan data pelapor",
          note: reason,
          status: "warning",
          visibility: "public",
        });
        showToast("Permintaan data telah dikirim kepada pelapor.");
        break;
      case "request-member-explanation":
        addTimelineEvent(ticket, {
          actor: user.name,
          role: "Bappebti",
          action: "Permintaan penjelasan resmi anggota",
          note: reason,
          status: "warning",
          visibility: "public",
        });
        showToast("Permintaan penjelasan resmi telah dikirim kepada anggota.");
        break;
      case "escalate-supervisor":
        setWorkflowState(ticket, "BAPPEBTI_SUPERVISOR_REVIEW", "Dalam Review Bappebti", {
          actor: user.name,
          role: "Bappebti",
          action: "Eskalasi ke Supervisor Bappebti",
          note: reason,
          status: "warning",
          visibility: "internal",
        });
        showToast("Kasus dieskalasi ke Supervisor Bappebti.");
        break;
      case "escalate-enforcement":
        setWorkflowState(ticket, "ENFORCEMENT_REVIEW", "Dalam Review Bappebti", {
          actor: user.name,
          role: "Bappebti",
          action: "Eskalasi ke Unit Penegakan",
          note: reason,
          status: "danger",
          visibility: "internal",
        });
        showToast("Kasus dieskalasi ke Unit Penegakan.");
        break;
      case "approve-resolution":
        setWorkflowState(ticket, "RESOLUTION_IMPLEMENTATION", "Solusi Sedang Dilaksanakan", {
          actor: user.name,
          role: "Bappebti",
          action: "Resolusi disetujui",
          note: reason,
          status: "success",
          visibility: "public",
        });
        showToast("Resolusi kasus telah disetujui.");
        break;
      case "close-resolved":
        closeCase(ticket, reason, user.name);
        showToast("Kasus berhasil ditutup sebagai selesai.");
        break;
      case "close-administrative":
        setWorkflowState(ticket, "CLOSED_ADMINISTRATIVE", "Ditutup Secara Administratif", {
          actor: user.name,
          role: "Bappebti",
          action: "Ditutup secara administratif",
          note: reason,
          status: "warning",
          visibility: "public",
        });
        showToast("Kasus ditutup secara administratif.");
        break;
      case "reopen":
        reopenCase(ticket, reason, user.name);
        showToast("Kasus berhasil dibuka kembali.");
        break;
    }
    setActiveAction(null);
  }

  const ACTION_COPY: Record<ActionKind, { title: string; description: string }> = {
    "request-reporter-info": { title: "Minta Data Tambahan dari Pelapor", description: "Kasus akan berpindah ke status Menunggu Data dari Anda hingga pelapor melengkapi informasi." },
    "request-member-explanation": { title: "Minta Penjelasan Resmi Anggota", description: "Anggota akan diminta memberikan penjelasan resmi tertulis atas penanganan kasus ini." },
    "escalate-supervisor": { title: "Eskalasi ke Supervisor Bappebti", description: "Kasus akan ditinjau oleh Supervisor Bappebti untuk keputusan pengawasan lanjutan." },
    "escalate-enforcement": { title: "Eskalasi ke Unit Penegakan", description: "Kasus akan diinvestigasi lebih lanjut oleh unit Penegakan Bappebti." },
    "approve-resolution": { title: "Setujui Resolusi", description: "Solusi yang diajukan anggota akan disetujui dan berpindah ke tahap implementasi." },
    "close-resolved": { title: "Tutup Kasus sebagai Selesai", description: "Kasus akan ditutup dan dinyatakan selesai setelah solusi diverifikasi terlaksana." },
    "close-administrative": { title: "Tutup Kasus Secara Administratif", description: "Kasus ditutup karena pelapor tidak memberikan data yang diminta dalam batas waktu." },
    reopen: { title: "Buka Kembali Kasus", description: "Kasus yang telah ditutup akan dibuka kembali untuk peninjauan lanjutan." },
  };

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

      {!isBappebtiRole && (
        <div className="mb-4 flex items-start gap-2 rounded-md border border-amber/40 bg-amber-bg px-3 py-2 text-xs text-amber">
          <ShieldAlert className="size-3.5 shrink-0 mt-0.5" />
          <p>
            Anda sedang masuk sebagai <span className="font-semibold">{user.name}</span> yang bukan
            peran Bappebti. Sebagian tindakan regulator di halaman ini disembunyikan sesuai matriks
            perizinan prototipe. Gunakan Mode Demonstrasi untuk beralih ke peran Bappebti.
          </p>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SeverityBadge severity={c.severity} />
        <span className="text-xs text-muted">
          Pelapor: <span className="font-medium text-foreground">{c.reporterName}</span> (identitas
          lengkap disamarkan pada tampilan ringkas ini demi kepatuhan privasi data)
        </span>
      </div>

      <div className="mb-4">
        <EscalationBanner complaintCase={c} />
      </div>

      <div className="mb-4">
        <CaseStatusExplanation complaintCase={c} viewer="internal" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className="lg:col-span-2">
          <Tabs defaultValue="ringkasan">
            <TabsList>
              <TabsTrigger value="ringkasan">Ringkasan Pengaduan</TabsTrigger>
              <TabsTrigger value="bukti">Bukti</TabsTrigger>
              <TabsTrigger value="respons">Respons Anggota</TabsTrigger>
              <TabsTrigger value="catatan">Catatan Internal</TabsTrigger>
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
                  <div>
                    <p className="text-[11px] uppercase text-muted font-medium mb-1">Indikator Risiko</p>
                    <p>
                      {[
                        c.suspectedFraud && "Dugaan Fraud",
                        c.activeSecurityRisk && "Risiko Keamanan Aktif",
                        c.illegalEntitySuspected && "Dugaan Entitas Tidak Berizin",
                        c.massIncident && "Bagian dari Insiden Massal",
                      ]
                        .filter(Boolean)
                        .join(", ") || "Tidak ada indikator khusus"}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-[11px] uppercase text-muted font-medium mb-1">Kronologi</p>
                    <p className="text-foreground/90">{c.chronology}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-[11px] uppercase text-muted font-medium mb-1">Penyelesaian yang Diharapkan</p>
                    <p className="text-foreground/90">{c.expectedResolution}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bukti">
              <Card>
                <CardContent className="py-4">
                  <EvidenceList files={c.evidences} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="respons">
              <Card>
                <CardHeader>
                  <CardTitle>Klarifikasi</CardTitle>
                </CardHeader>
                <CardContent className="py-4">
                  <ClarificationThread
                    messages={c.clarifications}
                    onReply={
                      canRequestClarification
                        ? (message) => {
                            addClarificationReply(ticket, user.name, "Bappebti", message);
                            showToast("Klarifikasi telah dikirim.");
                          }
                        : undefined
                    }
                    replyPlaceholder="Kirim permintaan klarifikasi kepada pelapor atau anggota..."
                  />
                </CardContent>
              </Card>
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Narasi Respons Anggota</CardTitle>
                </CardHeader>
                <CardContent className="py-4 space-y-3">
                  {memberResponses.length === 0 && (
                    <p className="text-sm text-muted">Belum ada respons dari anggota (platform/bursa/kliring).</p>
                  )}
                  {memberResponses.map((t, idx) => (
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
                  <p className="text-[11px] text-muted mt-1">
                    Catatan ini tidak pernah ditampilkan pada portal publik atau portal anggota.
                  </p>
                </CardHeader>
                <CardContent className="py-4 space-y-3">
                  {internalNotes.length === 0 && (
                    <p className="text-sm text-muted">Belum ada catatan internal untuk kasus ini.</p>
                  )}
                  {internalNotes.map((n, idx) => (
                    <div key={idx} className="rounded-md border border-border px-3 py-2 text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{n.author}</span>
                        <span className="text-[11px] text-muted">{n.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-muted mb-1">{n.role} &middot; {n.institution} &middot; {n.classification}</p>
                      <p>{n.text}</p>
                    </div>
                  ))}
                  <div className="pt-2 space-y-2">
                    <Select value={noteClass} onChange={(e) => setNoteClass(e.target.value as InternalNoteClassification)} className="w-48">
                      <option value="Operasional">Operasional</option>
                      <option value="Supervisi">Supervisi</option>
                      <option value="Legal">Legal</option>
                      <option value="Penegakan">Penegakan</option>
                    </Select>
                    <Textarea
                      placeholder="Tulis catatan internal Bappebti..."
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                    />
                    <Button
                      size="sm"
                      disabled={!noteText.trim()}
                      onClick={() => {
                        addInternalNote(ticket, {
                          author: user.name,
                          role: "Bappebti Case Officer",
                          institution: "Bappebti",
                          classification: noteClass,
                        text: noteText.trim(),
                        });
                        setNoteText("");
                        showToast("Catatan internal berhasil ditambahkan.");
                      }}
                    >
                      Tambah Catatan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resolusi">
              <ResolutionPanel complaintCase={c} />
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
        </div>

        {/* Sticky regulator context panel */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-18">
          <ResponsibilityPanel complaintCase={c} viewer="internal" />

          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted mb-2 flex items-center gap-1.5">
              <MessageCircle className="size-3.5" /> Klarifikasi
            </p>
            {clarifications.length === 0 ? (
              <p className="text-xs text-muted">Belum ada klarifikasi untuk kasus ini.</p>
            ) : (
              <div className="text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-muted">Klarifikasi Terbuka</span>
                  <span className="font-medium">{openClarifications.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Perlu Tindakan Bappebti</span>
                  <span className="font-medium">{clarificationsNeedingAction.length}</span>
                </div>
                {latestClarification && (
                  <div className="pt-1.5 border-t border-border">
                    <p className="text-muted">Klarifikasi Terbaru</p>
                    <Link
                      href={`/anggota/${getClarificationPortalSegment(latestClarification)}/klarifikasi/${latestClarification.id}`}
                      className="font-medium text-navy hover:underline"
                    >
                      {latestClarification.id}
                    </Link>
                    <p className="text-foreground/80 mt-0.5 truncate" title={latestClarification.subject}>
                      {latestClarification.subject}
                    </p>
                    <p className="text-muted mt-0.5">Batas waktu: {latestClarification.dueAt}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted mb-2">Jam SLA Aktif</p>
            <SlaSummary clocks={slaClocks} />
          </div>

          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted mb-2">Tindakan Regulator</p>
            <div className="flex flex-col gap-1.5">
              {canRequestClarification && (
                <Button variant="secondary" size="sm" className="justify-start" onClick={() => setActiveAction("request-reporter-info")}>
                  Minta Data Tambahan Pelapor
                </Button>
              )}
              {canRequestClarification && (
                <Button variant="secondary" size="sm" className="justify-start" onClick={() => setActiveAction("request-member-explanation")}>
                  Minta Penjelasan Resmi Anggota
                </Button>
              )}
              {canEscalate && (
                <Button variant="secondary" size="sm" className="justify-start" onClick={() => setActiveAction("escalate-supervisor")}>
                  Eskalasi ke Supervisor
                </Button>
              )}
              {canEscalate && (
                <Button variant="destructive" size="sm" className="justify-start" onClick={() => setActiveAction("escalate-enforcement")}>
                  Eskalasi ke Penegakan
                </Button>
              )}
              {canApprove && (
                <Button variant="success" size="sm" className="justify-start" onClick={() => setActiveAction("approve-resolution")}>
                  Setujui Resolusi
                </Button>
              )}
              {canClose && (
                <Button variant="secondary" size="sm" className="justify-start" onClick={() => setActiveAction("close-resolved")}>
                  Tutup Kasus — Selesai
                </Button>
              )}
              {canClose && (
                <Button variant="outline" size="sm" className="justify-start" onClick={() => setActiveAction("close-administrative")}>
                  Tutup Secara Administratif
                </Button>
              )}
              {canReopen && (
                <Button variant="ghost" size="sm" className="justify-start" onClick={() => setActiveAction("reopen")}>
                  Buka Kembali Kasus
                </Button>
              )}
              {!canRequestClarification && !canEscalate && !canApprove && !canClose && !canReopen && (
                <p className="text-[11px] text-muted">Tidak ada tindakan yang tersedia untuk peran demonstrasi ini.</p>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted mb-2 flex items-center gap-1.5">
              <FileText className="size-3.5" /> Bukti Terlampir
            </p>
            <p className="text-xs text-muted">{c.evidences.length} berkas — lihat tab Bukti untuk detail.</p>
          </div>
        </div>
      </div>

      {activeAction && (
        <WorkflowTransitionDialog
          open={!!activeAction}
          onOpenChange={(v) => !v && setActiveAction(null)}
          title={ACTION_COPY[activeAction].title}
          description={ACTION_COPY[activeAction].description}
          onConfirm={runAction}
        />
      )}
    </div>
  );
}
