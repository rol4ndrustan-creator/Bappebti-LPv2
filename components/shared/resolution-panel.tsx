"use client";

import * as React from "react";
import { ComplaintCase, ReporterResolutionDecision } from "@/lib/types";
import { formatCurrencyIDR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "./empty-state";
import { EvidenceList } from "./evidence-list";
import { FileCheck2 } from "lucide-react";

const DECISION_OPTIONS: { value: ReporterResolutionDecision; label: string; requiresReason: boolean }[] = [
  { value: "Menerima Sepenuhnya", label: "Saya menerima solusi", requiresReason: false },
  { value: "Menerima Sebagian", label: "Saya menerima sebagian", requiresReason: true },
  { value: "Masalah Belum Selesai", label: "Masalah belum selesai", requiresReason: true },
  { value: "Membutuhkan Penjelasan", label: "Saya membutuhkan penjelasan", requiresReason: true },
  { value: "Belum Dilaksanakan", label: "Solusi belum dilaksanakan", requiresReason: true },
  { value: "Bukti Bertentangan", label: "Bukti bertentangan dengan jawaban", requiresReason: true },
  { value: "Meminta Review Bappebti", label: "Saya meminta review Bappebti", requiresReason: true },
];

export function ResolutionPanel({
  complaintCase,
  onRespond,
}: {
  complaintCase: ComplaintCase;
  onRespond?: (decision: ReporterResolutionDecision, reason?: string) => void;
}) {
  const resolution = complaintCase.resolution;
  const legacyProposal = complaintCase.resolutionProposal;
  const [decision, setDecision] = React.useState<ReporterResolutionDecision>("Menerima Sepenuhnya");
  const [reason, setReason] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  if (!resolution && !legacyProposal) {
    return (
      <EmptyState
        icon={FileCheck2}
        title="Belum ada solusi yang diajukan"
        description="Solusi akan ditampilkan di sini setelah pihak terkait mengajukan resolusi atas pengaduan Anda."
      />
    );
  }

  const alreadyDecided = resolution?.reporterDecision;
  const selected = DECISION_OPTIONS.find((o) => o.value === decision)!;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-green/30 bg-green-bg/30 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-green mb-1">Solusi Telah Diajukan</p>
        <p className="text-sm text-foreground">{resolution?.proposal ?? legacyProposal}</p>
        <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          {resolution?.resolutionType && (
            <div>
              <dt className="text-muted">Jenis Solusi</dt>
              <dd className="font-medium">{resolution.resolutionType}</dd>
            </div>
          )}
          {resolution?.proposedBy && (
            <div>
              <dt className="text-muted">Diajukan Oleh</dt>
              <dd className="font-medium">{resolution.proposedBy}</dd>
            </div>
          )}
          {resolution?.proposedDate && (
            <div>
              <dt className="text-muted">Tanggal Diajukan</dt>
              <dd className="font-medium">{resolution.proposedDate}</dd>
            </div>
          )}
          {resolution?.monetaryAdjustment !== undefined && (
            <div>
              <dt className="text-muted">Penyesuaian Dana</dt>
              <dd className="font-medium">{formatCurrencyIDR(resolution.monetaryAdjustment)}</dd>
            </div>
          )}
          {resolution?.implementationDeadline && (
            <div>
              <dt className="text-muted">Batas Waktu Pelaksanaan</dt>
              <dd className="font-medium">{resolution.implementationDeadline}</dd>
            </div>
          )}
          {resolution?.nonMonetaryAction && (
            <div className="sm:col-span-2">
              <dt className="text-muted">Tindakan Non-Finansial</dt>
              <dd className="font-medium">{resolution.nonMonetaryAction}</dd>
            </div>
          )}
        </dl>
        {resolution?.implementationEvidence && resolution.implementationEvidence.length > 0 && (
          <div className="mt-3">
            <p className="text-[11px] text-muted mb-1">Bukti Pelaksanaan</p>
            <EvidenceList files={resolution.implementationEvidence} />
          </div>
        )}
        {resolution?.bappebtiDecision && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[11px] text-muted">Status Review Bappebti:</span>
            <Badge variant={resolution.bappebtiDecision === "Disetujui" ? "green" : resolution.bappebtiDecision === "Ditolak" ? "red" : "amber"}>
              {resolution.bappebtiDecision}
            </Badge>
          </div>
        )}
      </div>

      {alreadyDecided ? (
        <div className="rounded-md border border-border bg-card p-3 text-xs">
          <p className="text-muted">Keputusan Anda atas solusi ini:</p>
          <p className="font-medium text-foreground mt-0.5">{alreadyDecided}</p>
          {resolution?.reporterDisagreementReason && (
            <p className="text-foreground/80 mt-1">Alasan: {resolution.reporterDisagreementReason}</p>
          )}
        </div>
      ) : onRespond ? (
        <div className="rounded-md border border-border p-3">
          <p className="text-xs font-semibold text-navy mb-2">Tanggapan Anda atas Solusi</p>
          <Select value={decision} onChange={(e) => setDecision(e.target.value as ReporterResolutionDecision)} className="mb-2">
            {DECISION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
          {selected.requiresReason && (
            <Textarea
              placeholder="Jelaskan alasan Anda..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="text-xs min-h-[70px] mb-2"
            />
          )}
          <Button
            size="sm"
            disabled={submitted || (selected.requiresReason && !reason.trim())}
            onClick={() => {
              onRespond(decision, selected.requiresReason ? reason.trim() : undefined);
              setSubmitted(true);
            }}
          >
            Kirim Tanggapan
          </Button>
        </div>
      ) : null}
    </div>
  );
}
