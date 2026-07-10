import { ComplaintCase } from "@/lib/types";
import { getStatusExplanation } from "@/lib/workflow-config";
import { CaseStatusBadge } from "./case-status-badge";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Answers the four questions every case screen must address (Section 2.1):
 * what is happening, who must act, what action is required, and by when.
 */
export function CaseStatusExplanation({
  complaintCase,
  viewer = "public",
}: {
  complaintCase: ComplaintCase;
  viewer?: "public" | "internal";
}) {
  const ex = getStatusExplanation(complaintCase, viewer);

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        ex.actionRequiredFromViewer ? "border-amber/40 bg-amber-bg/40" : "border-border bg-card"
      )}
    >
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <CaseStatusBadge complaintCase={complaintCase} />
        {ex.actionRequiredFromViewer ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber">
            <AlertCircle className="size-3.5" /> Tindakan diperlukan
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-green">
            <CheckCircle2 className="size-3.5" /> Tidak ada tindakan yang diperlukan saat ini
          </span>
        )}
      </div>
      <p className="text-sm text-foreground leading-relaxed">{ex.what}</p>
      <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <div>
          <dt className="text-muted">Siapa yang menangani</dt>
          <dd className="font-medium text-foreground">{ex.who}</dd>
        </div>
        <div>
          <dt className="text-muted">Tindakan yang diperlukan</dt>
          <dd className="font-medium text-foreground">{ex.action}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-muted">Batas waktu</dt>
          <dd className="font-medium text-foreground">{ex.deadline}</dd>
        </div>
      </dl>
    </div>
  );
}
