"use client";

import * as React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PrototypeNotice } from "@/components/shared/prototype-notice";
import { useToast } from "@/components/shared/toast-provider";
import { useDemoSession } from "@/lib/demo-session";
import { ROLE_LABEL } from "@/lib/permissions";
import { getCaseByTicket } from "@/lib/mock-data";
import { useCaseData } from "@/lib/mock-service/store";
import {
  useClarification,
  saveClarificationDraft,
  submitClarificationResponse,
  completeClarification,
  requestClarificationRevision,
  requestAdditionalInformation,
  markClarificationPartiallyComplete,
  extendClarificationDeadline,
  markClarificationViewed,
} from "@/lib/mock-service/clarification-store";
import {
  canViewClarification,
  canRespondToClarification,
  canReviewClarification,
  canExtendClarificationDeadline,
  getMaxHistoryVisibility,
  getViewerRelation,
  formatMockDateTime,
} from "@/lib/clarification-workflow";
import { CaseStatusBadge } from "@/components/shared/case-status-badge";
import { ClarificationDetailHeader } from "./detail-header";
import { ClarificationActionCard } from "./action-card";
import { ClarificationRequestPanel } from "./request-panel";
import { ClarificationResponsePanel } from "./response-panel";
import { ClarificationReviewPanel } from "./review-panel";
import { ClarificationAttachmentList } from "./attachment-list";
import { ClarificationHistory } from "./history";
import { ClarificationDeadlineCard } from "./deadline-card";
import { ClarificationStatusBadge, ClarificationDirectionBadge } from "./badges";
import { ShieldOff, FileQuestion, Clock } from "lucide-react";

export function ClarificationDetailView({
  clarificationId,
  listHref,
  caseHrefBase,
}: {
  clarificationId: string;
  listHref: string;
  caseHrefBase: string;
}) {
  const { user } = useDemoSession();
  const { showToast } = useToast();
  const clarification = useClarification(clarificationId);
  const viewer = React.useMemo(() => ({ role: user.role, institution: user.institution }), [user]);
  const viewerRoleLabel = ROLE_LABEL[user.role];
  const baseCase = clarification ? getCaseByTicket(clarification.caseTicket) : undefined;
  const relatedCase = useCaseData(baseCase);

  const [extendOpen, setExtendOpen] = React.useState(false);
  const [extendDue, setExtendDue] = React.useState("");
  const [extendReason, setExtendReason] = React.useState("");

  React.useEffect(() => {
    if (!clarification) return;
    const relation = getViewerRelation(clarification, viewer);
    if (relation === "actor" || canReviewClarification(viewer, clarification)) {
      markClarificationViewed(clarification.id, user.name, viewerRoleLabel, viewer.institution);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clarification?.id]);

  if (!clarification) {
    return (
      <div>
        <PageHeader title="Klarifikasi Tidak Ditemukan" />
        <Card>
          <CardContent className="py-10">
            <EmptyState
              icon={FileQuestion}
              title="Klarifikasi tidak ditemukan"
              description={`ID klarifikasi "${clarificationId}" tidak ada atau telah dihapus.`}
              action={
                <Link href={listHref}>
                  <Button variant="secondary" size="sm" className="mt-2">
                    Kembali ke Daftar Klarifikasi
                  </Button>
                </Link>
              }
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!canViewClarification(viewer, clarification)) {
    return (
      <div>
        <PageHeader title="Akses Ditolak" />
        <Card>
          <CardContent className="py-10">
            <EmptyState
              icon={ShieldOff}
              title="Anda tidak memiliki akses ke klarifikasi ini"
              description="Klarifikasi ini hanya dapat dilihat oleh institusi yang terlibat langsung sebagai pihak peminta atau pihak yang diminta."
              action={
                <Link href={listHref}>
                  <Button variant="secondary" size="sm" className="mt-2">
                    Kembali ke Daftar Klarifikasi
                  </Button>
                </Link>
              }
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  const canRespond = canRespondToClarification(viewer, clarification);
  const canReview = canReviewClarification(viewer, clarification);
  const canExtend = canExtendClarificationDeadline(viewer, clarification);
  const maxVisibility = getMaxHistoryVisibility(user.role);

  return (
    <div>
      <ClarificationDetailHeader clarification={clarification} listHref={listHref} caseHref={`${caseHrefBase}/${clarification.caseTicket}`} />
      <PrototypeNotice className="mb-4" />

      <div className="mb-4">
        <ClarificationActionCard clarification={clarification} viewer={viewer} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className="lg:col-span-2">
          <Tabs defaultValue="permintaan">
            <TabsList>
              <TabsTrigger value="permintaan">Permintaan</TabsTrigger>
              <TabsTrigger value="respons">Respons</TabsTrigger>
              <TabsTrigger value="dokumen">Dokumen</TabsTrigger>
              <TabsTrigger value="riwayat">Riwayat Klarifikasi</TabsTrigger>
              <TabsTrigger value="kasus">Informasi Kasus</TabsTrigger>
            </TabsList>

            <TabsContent value="permintaan">
              <ClarificationRequestPanel clarification={clarification} />
            </TabsContent>

            <TabsContent value="respons">
              <div className="flex flex-col gap-4">
                <ClarificationResponsePanel
                  clarification={clarification}
                  viewer={viewer}
                  defaultOfficer={user.name}
                  onSaveDraft={(raw) => {
                    saveClarificationDraft(clarification.id, raw);
                    showToast("Draf respons tersimpan.");
                  }}
                  onSubmit={(draft) => {
                    submitClarificationResponse(
                      clarification.id,
                      {
                        summary: draft.summary,
                        detailedExplanation: draft.detailedExplanation,
                        referencedTransaction: draft.referencedTransaction || undefined,
                        factsConfirmed: draft.factsConfirmed || undefined,
                        factsNotConfirmed: draft.factsNotConfirmed || undefined,
                        respondingOfficer: draft.respondingOfficer,
                        supervisorApproval: draft.supervisorApproval || undefined,
                        submittedAt: new Date().toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }),
                      },
                      user.name,
                      viewerRoleLabel,
                      viewer.institution
                    );
                    showToast("Respons klarifikasi berhasil dikirim.");
                  }}
                />
                {canReview && (
                  <ClarificationReviewPanel
                    clarification={clarification}
                    onAccept={(note) => {
                      completeClarification(clarification.id, user.name, viewerRoleLabel, note);
                      showToast("Klarifikasi dinyatakan selesai.");
                    }}
                    onRequestRevision={(reason, corrections, newDueAt) => {
                      requestClarificationRevision(clarification.id, reason, corrections, newDueAt, user.name, viewerRoleLabel);
                      showToast("Permintaan perbaikan respons telah dikirim.");
                    }}
                    onRequestMoreInfo={(question) => {
                      requestAdditionalInformation(clarification.id, question, user.name, viewerRoleLabel);
                      showToast("Permintaan informasi tambahan telah dikirim.");
                    }}
                    onMarkPartial={(note) => {
                      markClarificationPartiallyComplete(clarification.id, note, user.name, viewerRoleLabel);
                      showToast("Klarifikasi ditandai sebagian lengkap.");
                    }}
                  />
                )}
                {!canRespond && !canReview && !clarification.formalResponse && (
                  <p className="text-xs text-muted">Tidak ada tindakan yang tersedia bagi institusi Anda pada klarifikasi ini.</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="dokumen">
              <Card className="mb-4">
                <CardContent className="py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted mb-2">Dokumen Permintaan</p>
                  <ClarificationAttachmentList attachments={clarification.attachments} />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted mb-2">Dokumen Respons</p>
                  <ClarificationAttachmentList attachments={clarification.responseAttachments} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="riwayat">
              <Card>
                <CardContent className="py-4">
                  <ClarificationHistory events={clarification.history} maxVisibility={maxVisibility} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="kasus">
              <Card>
                <CardContent className="py-4">
                  {relatedCase ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={`${caseHrefBase}/${relatedCase.ticket}`} className="font-medium text-navy hover:underline">
                          {relatedCase.ticket}
                        </Link>
                        <CaseStatusBadge complaintCase={relatedCase} />
                      </div>
                      <p className="text-foreground/90">{relatedCase.title}</p>
                      <p className="text-xs text-muted">Pelapor: {relatedCase.reporterName}</p>
                      <p className="text-xs text-muted">Pelaku usaha: {relatedCase.platform}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted">Kasus terkait tidak ditemukan.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sticky context panel */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-18">
          <div className="rounded-lg border border-border bg-card p-3 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Ringkasan</p>
            <dl className="text-xs space-y-1.5">
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Status</dt>
                <dd><ClarificationStatusBadge status={clarification.status} /></dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Arah</dt>
                <dd><ClarificationDirectionBadge direction={clarification.requestDirection} /></dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Pihak Peminta</dt>
                <dd className="font-medium text-right">{clarification.requestedBy.institutionName}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Pihak yang Menjawab</dt>
                <dd className="font-medium text-right">{clarification.requestedFrom.institutionName}</dd>
              </div>
              {clarification.requestedFrom.userName && (
                <div className="flex justify-between gap-2">
                  <dt className="text-muted">Petugas Ditugaskan</dt>
                  <dd className="font-medium text-right">{clarification.requestedFrom.userName}</dd>
                </div>
              )}
            </dl>
          </div>

          <ClarificationDeadlineCard clarification={clarification} />

          {canExtend && (
            <Button variant="secondary" size="sm" className="w-full justify-start" onClick={() => setExtendOpen(true)}>
              <Clock className="size-3.5" /> Perpanjang Batas Waktu
            </Button>
          )}
        </div>
      </div>

      <Dialog open={extendOpen} onOpenChange={setExtendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Perpanjang Batas Waktu</DialogTitle>
            <DialogDescription>Batas waktu semula tetap tercatat pada riwayat untuk keperluan audit.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <div>
              <Label htmlFor="ext-due">Batas waktu baru</Label>
              <Input id="ext-due" type="datetime-local" value={extendDue} onChange={(e) => setExtendDue(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="ext-reason">Alasan perpanjangan</Label>
              <Textarea id="ext-reason" value={extendReason} onChange={(e) => setExtendReason(e.target.value)} className="min-h-[70px]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" size="sm" onClick={() => setExtendOpen(false)}>
              Batal
            </Button>
            <Button
              size="sm"
              disabled={!extendDue || !extendReason.trim()}
              onClick={() => {
                extendClarificationDeadline(clarification.id, formatMockDateTime(new Date(extendDue)), extendReason.trim(), user.name, viewerRoleLabel);
                showToast("Batas waktu klarifikasi telah diperpanjang.");
                setExtendOpen(false);
                setExtendDue("");
                setExtendReason("");
              }}
            >
              Konfirmasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
