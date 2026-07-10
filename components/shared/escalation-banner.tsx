import { ComplaintCase } from "@/lib/types";
import { ESCALATION_LEVEL_LABEL } from "@/lib/workflow-config";
import { ShieldAlert } from "lucide-react";

export function EscalationBanner({ complaintCase }: { complaintCase: ComplaintCase }) {
  const level = complaintCase.institution?.escalationLevel ?? 0;
  const reason = complaintCase.institution?.escalationReason ?? complaintCase.escalationReason;
  if (level === 0 || !reason) return null;

  return (
    <div className="flex items-start gap-2 rounded-md border border-red/30 bg-red-bg px-3 py-2 text-xs text-red">
      <ShieldAlert className="size-4 shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold">{ESCALATION_LEVEL_LABEL[level]}</p>
        <p className="mt-0.5 text-foreground/80">{reason}</p>
      </div>
    </div>
  );
}
