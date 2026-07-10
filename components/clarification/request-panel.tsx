import { ClarificationRequest } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const CHECKLIST_TONE: Record<string, "green" | "amber" | "red" | "muted"> = {
  "Belum Diberikan": "muted",
  "Sudah Diberikan": "amber",
  "Perlu Diperbaiki": "red",
  Diterima: "green",
};

/** Section 6 — the full, untruncated request, reason, and requested-information checklist. */
export function ClarificationRequestPanel({ clarification }: { clarification: ClarificationRequest }) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="py-4 space-y-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted mb-1">Subjek</p>
            <p className="text-sm font-medium text-foreground">{clarification.subject}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted mb-1">Pertanyaan</p>
            <p className="text-sm text-foreground/90 whitespace-pre-wrap">{clarification.question}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted mb-1">Alasan Diperlukan</p>
            <p className="text-sm text-foreground/90 whitespace-pre-wrap">{clarification.reason}</p>
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <div>
              <dt className="text-muted">Diminta Oleh</dt>
              <dd className="font-medium">
                {clarification.requestedBy.userName ?? clarification.requestedBy.roleLabel} ({clarification.requestedBy.institutionName})
              </dd>
            </div>
            <div>
              <dt className="text-muted">Tanggal Permintaan</dt>
              <dd className="font-medium">{clarification.createdAt}</dd>
            </div>
            <div>
              <dt className="text-muted">Batas Waktu</dt>
              <dd className="font-medium">{clarification.dueAt}</dd>
            </div>
          </dl>
          {clarification.requestedEvidenceTypes && clarification.requestedEvidenceTypes.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted mb-1">Kategori Dokumen Diminta</p>
              <div className="flex flex-wrap gap-1.5">
                {clarification.requestedEvidenceTypes.map((t) => (
                  <Badge key={t} variant="outline">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {clarification.requestedFields && clarification.requestedFields.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted mb-1">Data yang Diminta</p>
              <div className="flex flex-wrap gap-1.5">
                {clarification.requestedFields.map((t) => (
                  <Badge key={t} variant="outline">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {clarification.requestedInformation && clarification.requestedInformation.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted mb-2">Checklist Informasi Diminta</p>
            <ul className="space-y-2">
              {clarification.requestedInformation.map((item) => (
                <li key={item.label} className="flex items-center justify-between gap-2 text-sm">
                  <span>{item.label}</span>
                  <Badge variant={CHECKLIST_TONE[item.status]}>{item.status}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
