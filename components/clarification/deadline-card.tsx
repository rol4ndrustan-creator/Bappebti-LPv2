import { ClarificationRequest } from "@/lib/types";
import { formatClarificationRemaining, getClarificationDeadlineStatus, DEADLINE_STATUS_TONE } from "@/lib/clarification-workflow";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

export function ClarificationDeadlineCard({ clarification }: { clarification: ClarificationRequest }) {
  const deadlineStatus = getClarificationDeadlineStatus(clarification);
  const isOverdue = clarification.status === "OVERDUE";

  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Batas Waktu</p>
        <Badge variant={DEADLINE_STATUS_TONE[deadlineStatus]}>{deadlineStatus.toUpperCase()}</Badge>
      </div>
      <dl className="text-xs space-y-1.5">
        <div className="flex justify-between gap-2">
          <dt className="text-muted">Dibuat</dt>
          <dd className="font-medium text-right">{clarification.createdAt}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-muted">Batas Waktu</dt>
          <dd className="font-medium text-right">{clarification.dueAt}</dd>
        </div>
        {clarification.originalDueAt && clarification.originalDueAt !== clarification.dueAt && (
          <div className="flex justify-between gap-2">
            <dt className="text-muted">Batas Waktu Semula</dt>
            <dd className="font-medium text-right text-muted line-through">{clarification.originalDueAt}</dd>
          </div>
        )}
      </dl>
      <p className="text-xs font-medium text-foreground">{formatClarificationRemaining(clarification)}</p>
      {isOverdue && (
        <div className="flex items-start gap-1.5 rounded-md border border-red/30 bg-red-bg px-2 py-1.5 text-[11px] text-red">
          <AlertTriangle className="size-3.5 shrink-0 mt-0.5" />
          <p>
            Permintaan ini telah melewati batas waktu
            {clarification.breachedAt ? ` sejak ${clarification.breachedAt}` : ""}. Klarifikasi tetap terbuka dan
            respons tetap dapat dikirim.
          </p>
        </div>
      )}
    </div>
  );
}
