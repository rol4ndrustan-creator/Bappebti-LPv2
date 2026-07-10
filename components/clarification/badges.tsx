import { Badge } from "@/components/ui/badge";
import { ClarificationRequest } from "@/lib/types";
import {
  CLARIFICATION_STATUS_LABEL,
  CLARIFICATION_STATUS_TONE,
  CLARIFICATION_PRIORITY_LABEL,
  DEADLINE_STATUS_TONE,
  getClarificationDeadlineStatus,
} from "@/lib/clarification-workflow";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { cn } from "@/lib/utils";

export function ClarificationStatusBadge({ status }: { status: ClarificationRequest["status"] }) {
  return <Badge variant={CLARIFICATION_STATUS_TONE[status]}>{CLARIFICATION_STATUS_LABEL[status].toUpperCase()}</Badge>;
}

export function ClarificationDirectionBadge({ direction }: { direction: ClarificationRequest["requestDirection"] }) {
  const isIncoming = direction === "INCOMING";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
        isIncoming ? "bg-navy/10 text-navy border-navy/20" : "bg-muted-bg text-muted border-transparent"
      )}
    >
      {isIncoming ? <ArrowDownToLine className="size-3" /> : <ArrowUpFromLine className="size-3" />}
      {isIncoming ? "Masuk" : "Keluar"}
    </span>
  );
}

export function ClarificationPriorityBadge({ priority }: { priority: ClarificationRequest["priority"] }) {
  const tone = priority === "CRITICAL" ? "red" : priority === "HIGH" ? "amber" : priority === "MEDIUM" ? "navy" : "muted";
  return <Badge variant={tone}>{CLARIFICATION_PRIORITY_LABEL[priority].toUpperCase()}</Badge>;
}

export function ClarificationDeadlineBadge({ clarification }: { clarification: ClarificationRequest }) {
  const status = getClarificationDeadlineStatus(clarification);
  return <Badge variant={DEADLINE_STATUS_TONE[status]}>{status.toUpperCase()}</Badge>;
}
