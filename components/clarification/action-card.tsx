import { ClarificationRequest } from "@/lib/types";
import {
  ClarificationViewer,
  describeClarificationRelation,
  formatClarificationRemaining,
  getClarificationActionButtonLabel,
  getViewerRelation,
} from "@/lib/clarification-workflow";
import { Button } from "@/components/ui/button";
import { ClarificationStatusBadge } from "./badges";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The main status card (Section 5.B) — must answer: what is requested, who
 * asked, who must answer, the deadline, whether the viewer must act, and
 * what to do next.
 */
export function ClarificationActionCard({
  clarification,
  viewer,
  onPrimaryAction,
}: {
  clarification: ClarificationRequest;
  viewer: ClarificationViewer;
  onPrimaryAction?: () => void;
}) {
  const relation = getViewerRelation(clarification, viewer);
  const needsViewerAction = relation === "actor" && clarification.status !== "COMPLETED" && clarification.status !== "CANCELLED";
  const buttonLabel = getClarificationActionButtonLabel(clarification, viewer);

  return (
    <div className={cn("rounded-lg border p-4", needsViewerAction ? "border-amber/40 bg-amber-bg/40" : "border-border bg-card")}>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <ClarificationStatusBadge status={clarification.status} />
        {needsViewerAction ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber">
            <AlertCircle className="size-3.5" /> Tindakan diperlukan dari institusi Anda
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-green">
            <CheckCircle2 className="size-3.5" /> Tidak ada tindakan yang diperlukan dari institusi Anda saat ini
          </span>
        )}
      </div>
      <p className="text-sm text-foreground leading-relaxed">{describeClarificationRelation(clarification)}</p>
      <p className="text-xs text-muted mt-1">{formatClarificationRemaining(clarification)}</p>
      {needsViewerAction && onPrimaryAction && (
        <Button size="sm" className="mt-3" onClick={onPrimaryAction}>
          {buttonLabel}
        </Button>
      )}
    </div>
  );
}
