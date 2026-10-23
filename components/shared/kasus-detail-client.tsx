"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { SeverityBadge } from "@/components/shared/badges";
import { CaseStatusExplanation } from "@/components/shared/case-status-explanation";
import { EscalationBanner } from "@/components/shared/escalation-banner";
import { ClarificationThread } from "@/components/shared/clarification-thread";
import { EvidenceList } from "@/components/shared/evidence-list";
import { FileUploader } from "@/components/shared/file-uploader";
import { ResolutionPanel } from "@/components/shared/resolution-panel";
import { CaseActionDialog, TONE_TO_BUTTON_VARIANT } from "@/components/shared/case-action-dialog";
import { useToast } from "@/components/shared/toast-provider";
import { useDemoSession } from "@/lib/demo-session";
import { getCaseByTicket, formatCurrency, CASE_TASKS } from "@/lib/mock-data";
import { CASE_ACTIONS, CaseActionId, executeCaseAction } from "@/lib/case-actions";
import {
  useCaseData,
  addClarificationReply,
  addInternalNote,
  setSeverity,
  setCurrentOwner,
  addTimelineEvent,
  proposeResolution,
  addEvidence,
} from "@/lib/mock-service/store";
import { useTasksForCase, addTask, updateTaskStatus, deleteTask } from "@/lib/mock-service/task-store";
import { DEMO_USERS, ROLE_LABEL, getViewerGroup, ViewerGroup } from "@/lib/permissions";
import { InternalNoteClassification, Severity, CaseTaskStatus } from "@/lib/types";
import { Plus, Trash2, Lock } from "lucide-react";

const BACK_HREF: Record<ViewerGroup, string> = {
  User: "/bappebti/antrean",
  Bappebti: "/bappebti/antrean",
  Platform: "/platform/case-queue",
  EkosistemActive: "/ekosistem/active/pengaduan",
  EkosistemPengawas: "/ekosistem/pengawas/pengaduan",
};

const SEVERITY_OPTIONS: Severity[] = ["Rendah", "Sedang", "Tinggi", "Kritis"];
const TASK_STATUSES: CaseTaskStatus[] = ["Pending", "In Progress", "Done"];
const ASSIGNABLE_NAMES = DEMO_USERS.filter((u) => u.role !== "PUBLIC_REPORTER" && u.role !== "PUBLIC_REPRESENTATIVE").map((u) => u.name);

export default function KasusDetailClient({ ticket }: { ticket: string }) {
  const base = getCaseByTicket(ticket);
  const c = useCaseData(base);
  const { showToast } = useToast();
  const { user } = useDemoSession();
  const tasks = useTasksForCase(ticket, CASE_TASKS);

  const [noteText, setNoteText] = useState("");
  const [noteClass, setNoteClass] = useState<InternalNoteClassification>("Operasional");
  const [activeAction, setActiveAction] = useState<CaseActionId | null>(null);
  const [escalating, setEscalating] = useState(false);
  const [resolutionText, setResolutionText] = useState("");
  const [newEvidenceFiles, setNewEvidenceFiles] = useState<string[]>([]);
  const [taskDesc, setTaskDesc] = useState("");
  const [taskAssignee, setTaskAssignee] = useState(ASSIGNABLE_NAMES[0] ?? "");
  const [taskDoc, setTaskDoc] = useState("");

  if (!c) {
    return (
      <div>
        <PageHeader title="Kasus Tidak Ditemukan" />
        <Card>
          <CardContent className="text-sm text-muted py-6 text-center">
            Kasus dengan tiket <span className="font-medium text-foreground">{ticket}</span> tidak ditemukan.
            <div className="mt-3">
              <Link href="/bappebti/antrean">
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

  const viewerGroup: ViewerGroup = getViewerGroup(user.role);
  const isBappebti = viewerGroup === "Bappebti";
  const isInternal = viewerGroup !== "User";
  const isPlatform = viewerGroup === "Platform";

  // Role Restriction Rule (Bab II): a Platform CS/PIC may only open tickets
  // assigned to them; direct-URL access to another ticket is blocked.
  // Admin/Supervisor (and every other role) are unrestricted.
  const isUnauthorized =
    user.role === "PLATFORM_CASE_OFFICER" && !!c.platformPic && c.platformPic !== user.name;

  if (isUnauthorized) {
    return (
      <div>
        <PageHeader title="Akses Ditolak" />
        <Card>
          <CardContent className="py-8 text-center">
            <Lock className="size-8 text-red mx-auto mb-3" />
            <p className="text-sm font-semibold text-foreground">403 — Unauthorized</p>
            <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
              Tiket {ticket} ditugaskan kepada {c.platformPic}. Anda hanya dapat membuka tiket yang
              ditugaskan kepada Anda sendiri.
            </p>
            <div className="mt-4">
              <Link href="/platform/case-queue">
                <Button variant="secondary" size="sm">Kembali ke Case Queue</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const internalNotes = c.internalNotes ?? [];

  function handleExecuteAction(actionId: CaseActionId, values: Record<string, string>) {
    executeCaseAction(actionId, { ticket, actor: user.name, values });
    showToast(`${CASE_ACTIONS[actionId].label} berhasil dijalankan.`);
  }

  function confirmEscalateToBappebti() {
    setCurrentOwner(ticket, "Bappebti");
    addTimelineEvent(ticket, {
      actor: user.name,
      role: viewerGroup === "Platform" ? "Platform" : "Ekosistem",
      action: "Kasus dieskalasi ke Bappebti",
      note: `Kasus dieskalasi oleh ${user.name} (${c?.platform ?? user.institution}) ke Bappebti untuk supervisi lebih lanjut.`,
      status: "warning",
      visibility: "internal",
    });
    showToast("Kasus dieskalasi ke Bappebti.");
    setEscalating(false);
  }

  function submitTask() {
    if (!taskDesc.trim() || !taskAssignee) return;
    addTask({
      ticket,
      description: taskDesc.trim(),
      createdBy: user.name,
      createdByRole: ROLE_LABEL[user.role],
      assignee: taskAssignee,
      document: taskDoc || undefined,
    });
    showToast("Tugas internal berhasil ditambahkan.");
    setTaskDesc("");
    setTaskDoc("");
  }

  const canManageTasks = viewerGroup === "Bappebti" || viewerGroup === "Platform" || viewerGroup === "EkosistemActive";
  const canProposeResolution = isPlatform || isBappebti;
  const canUploadEvidence = isBappebti || isPlatform;
  const canEscalateToBappebti =
    (viewerGroup === "Platform" || viewerGroup === "EkosistemActive") && c.currentOwner !== "Bappebti" && c.status !== "Selesai";

  const bannerActions = (
    <>
      {isBappebti && (
        <>
          <Button size="sm" variant="outline" onClick={() => setActiveAction("assign-to-member")}>
            Tugaskan / Alihkan Penanggung Jawab
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setActiveAction("close-administrative")}>
            Tutup Secara Administratif
          </Button>
        </>
      )}
      {canEscalateToBappebti && (
        <Button size="sm" variant="outline" onClick={() => setEscalating(true)}>
          Eskalasi ke Bappebti
        </Button>
      )}
    </>
  );

  return (
    <div>
      <PageHeader
        title={`${c.ticket} — ${c.title}`}
        description="Detail pengaduan, riwayat penanganan, dan tindakan yang tersedia sesuai peran Anda."
        actions={
          <Link href={BACK_HREF[viewerGroup]}>
            <Button variant="secondary" size="sm">
              Kembali ke Daftar
            </Button>
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {isBappebti ? (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-muted">Prioritas:</span>
            <Select
              className="h-7 text-xs w-auto"
              value={c.severity ?? ""}
              onChange={(e) => setSeverity(ticket, e.target.value as Severity)}
            >
              <option value="" disabled>
                Belum ditentukan
              </option>
              {SEVERITY_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
        ) : (
          <SeverityBadge severity={c.severity} />
        )}
        <span className="text-xs text-muted">
          Pelapor: <span className="font-medium text-foreground">{c.reporterName}</span> (identitas
          lengkap disamarkan pada tampilan ringkas ini demi kepatuhan privasi data)
        </span>
        {viewerGroup === "Platform" && c.platformPic && (
          <span className="text-xs text-muted">
            PIC: <span className="font-medium text-foreground">{c.platformPic}</span>
          </span>
        )}
      </div>

      <div className="mb-4">
        <EscalationBanner complaintCase={c} />
      </div>

      <div className="mb-4">
        <CaseStatusExplanation complaintCase={c} viewer="internal" actions={isInternal ? bannerActions : undefined} />
      </div>

      <Tabs defaultValue="ringkasan">
        <TabsList>
          <TabsTrigger value="ringkasan">Ringkasan Pengaduan</TabsTrigger>
          <TabsTrigger value="bukti">Bukti</TabsTrigger>
          <TabsTrigger value="respons">Respon ke Public</TabsTrigger>
          {isInternal && <TabsTrigger value="catatan">Catatan Internal</TabsTrigger>}
          {isInternal && <TabsTrigger value="tugas">Tugas Internal</TabsTrigger>}
          <TabsTrigger value="resolusi">Resolusi</TabsTrigger>
          {isInternal && <TabsTrigger value="kronologi">Kronologi Kasus</TabsTrigger>}
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bukti">
          <Card>
            <CardContent className="py-4 space-y-4">
              <EvidenceList files={c.evidences} />
              {canUploadEvidence && (
                <div className="pt-3 border-t border-border space-y-2">
                  <p className="text-xs font-semibold text-navy">Unggah Bukti Tambahan</p>
                  <FileUploader files={newEvidenceFiles} onChange={setNewEvidenceFiles} />
                  <Button
                    size="sm"
                    disabled={newEvidenceFiles.length === 0}
                    onClick={() => {
                      addEvidence(ticket, newEvidenceFiles);
                      showToast("Bukti berhasil diunggah.");
                      setNewEvidenceFiles([]);
                    }}
                  >
                    Simpan Bukti
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="respons">
          <Card>
            <CardHeader>
              <CardTitle>Respon ke Public</CardTitle>
              <p className="text-[11px] text-muted mt-1">
                Kanal interaksi antara Pelapor, Platform, dan Bappebti. Respon yang dikirim dari sini dapat dibaca langsung oleh pelapor publik.
              </p>
            </CardHeader>
            <CardContent className="py-4">
              <ClarificationThread
                messages={c.clarifications}
                onReply={
                  viewerGroup === "Bappebti" || viewerGroup === "Platform"
                    ? (message) => {
                        addClarificationReply(ticket, user.name, isBappebti ? "Bappebti" : "Platform", message);
                        showToast("Respon telah dikirim.");
                      }
                    : undefined
                }
                replyPlaceholder="Kirim respon kepada pelapor..."
                confirmMessage="Respon ini akan dapat dibaca langsung oleh pelapor publik. Lanjutkan?"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {isInternal && (
          <TabsContent value="catatan">
            <Card>
              <CardHeader>
                <CardTitle>Catatan Internal</CardTitle>
                <p className="text-[11px] text-muted mt-1">
                  Catatan ini tidak pernah ditampilkan pada portal publik.
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
                    placeholder="Tulis catatan internal..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                  />
                  <Button
                    size="sm"
                    disabled={!noteText.trim()}
                    onClick={() => {
                      addInternalNote(ticket, {
                        author: user.name,
                        role: ROLE_LABEL[user.role],
                        institution: user.institution,
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
        )}

        {isInternal && (
          <TabsContent value="tugas">
            <Card>
              <CardHeader>
                <CardTitle>Tugas Internal</CardTitle>
                <p className="text-[11px] text-muted mt-1">
                  Modul pengingat penanganan (task reminder), bukan ruang obrolan. Penerima tugas dapat
                  mengubah status; pembuat tugas dapat mengubah status dan menghapus tugas.
                </p>
              </CardHeader>
              <CardContent className="py-4 space-y-3">
                {tasks.length === 0 && <p className="text-sm text-muted">Belum ada tugas untuk kasus ini.</p>}
                {tasks.map((t) => {
                  const canEdit = t.assignee === user.name || t.createdBy === user.name;
                  const canDelete = t.createdBy === user.name;
                  return (
                    <div key={t.id} className="rounded-md border border-border px-3 py-2 text-sm">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-medium">{t.description}</p>
                        {canDelete && (
                          <button
                            title="Hapus tugas"
                            onClick={() => {
                              deleteTask(t.id);
                              showToast("Tugas dihapus.");
                            }}
                            className="text-muted hover:text-red shrink-0"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted mb-1.5">
                        <span>Dari: <span className="text-foreground">{t.createdBy}</span></span>
                        <span>Untuk: <span className="text-foreground">{t.assignee}</span></span>
                        <span>{t.createdAt}</span>
                        {t.document && <span>Dokumen: <span className="text-foreground">{t.document}</span></span>}
                      </div>
                      {canEdit ? (
                        <Select
                          className="h-7 text-xs w-40"
                          value={t.status}
                          onChange={(e) => updateTaskStatus(t.id, e.target.value as CaseTaskStatus)}
                        >
                          {TASK_STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </Select>
                      ) : (
                        <Badge variant={t.status === "Done" ? "green" : t.status === "In Progress" ? "amber" : "muted"}>
                          {t.status}
                        </Badge>
                      )}
                    </div>
                  );
                })}

                {canManageTasks && (
                  <div className="pt-3 border-t border-border space-y-2">
                    <p className="text-xs font-semibold text-navy">Tambah Tugas</p>
                    <Textarea
                      placeholder="Deskripsi tugas..."
                      value={taskDesc}
                      onChange={(e) => setTaskDesc(e.target.value)}
                      className="text-xs min-h-[60px]"
                    />
                    <div>
                      <Label className="text-[11px]">Assignee</Label>
                      <Select className="h-8 text-xs w-48" value={taskAssignee} onChange={(e) => setTaskAssignee(e.target.value)}>
                        {ASSIGNABLE_NAMES.map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[11px]">Upload Dokumen (opsional)</Label>
                      <FileUploader
                        files={taskDoc ? [taskDoc] : []}
                        onChange={(files) => setTaskDoc(files[0] ?? "")}
                        multiple={false}
                        maxFiles={1}
                        label="Klik atau seret dokumen pendukung ke sini"
                      />
                    </div>
                    <Button size="sm" disabled={!taskDesc.trim()} onClick={submitTask}>
                      <Plus className="size-3.5" /> Tambah Tugas
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="resolusi">
          {canProposeResolution && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Ajukan Resolusi</CardTitle>
              </CardHeader>
              <CardContent className="py-4 space-y-2">
                <Textarea
                  placeholder="Tulis usulan resolusi untuk pelapor..."
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  className="text-sm min-h-[70px]"
                />
                <Button
                  size="sm"
                  variant="success"
                  disabled={!resolutionText.trim()}
                  onClick={() => {
                    proposeResolution(ticket, resolutionText.trim(), user.name, isBappebti ? "Bappebti" : "Platform");
                    showToast("Usulan resolusi telah diajukan kepada pelapor.");
                    setResolutionText("");
                  }}
                >
                  Ajukan Resolusi
                </Button>
              </CardContent>
            </Card>
          )}
          <ResolutionPanel complaintCase={c} />
        </TabsContent>

        {isInternal && (
          <TabsContent value="kronologi">
            <Card>
              <CardHeader>
                <CardTitle>Kronologi Kasus</CardTitle>
                <p className="text-[11px] text-muted mt-1">Jejak riwayat aktivitas dan tindakan kasus (read-only).</p>
              </CardHeader>
              <CardContent className="py-4 space-y-2">
                {c.timeline.length === 0 && <p className="text-sm text-muted">Belum ada aktivitas tercatat.</p>}
                {[...c.timeline].reverse().map((t, i) => (
                  <div key={i} className="rounded-md border border-border px-3 py-2 text-sm">
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
        )}
      </Tabs>

      {activeAction && (
        <CaseActionDialog
          action={CASE_ACTIONS[activeAction]}
          complaintCase={c}
          open={!!activeAction}
          onOpenChange={(v) => !v && setActiveAction(null)}
          onConfirm={(values) => {
            handleExecuteAction(activeAction, values);
            setActiveAction(null);
          }}
        />
      )}

      <Dialog open={escalating} onOpenChange={setEscalating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eskalasi ke Bappebti</DialogTitle>
            <DialogDescription>
              Kasus {ticket} akan dialihkan kepemilikannya ke Bappebti untuk supervisi lebih lanjut. Lanjutkan?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button size="sm" variant="secondary" onClick={() => setEscalating(false)}>Batal</Button>
            <Button size="sm" variant={TONE_TO_BUTTON_VARIANT.destructive} onClick={confirmEscalateToBappebti}>
              Ya, Eskalasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
