import { ComplaintCase } from "@/lib/types";
import { getCaseProgress } from "@/lib/workflow-config";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function CaseProgressTracker({ complaintCase }: { complaintCase: ComplaintCase }) {
  const { stages } = getCaseProgress(complaintCase);

  return (
    <ol className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-0">
      {stages.map((stage, i) => (
        <li key={stage.label} className="flex sm:flex-1 sm:flex-col items-center sm:items-center gap-2 sm:gap-1 relative">
          <div className="flex sm:hidden items-center gap-2 w-full">
            <StageDot status={stage.status} />
            <span className={cn("text-xs font-medium", stage.status === "upcoming" ? "text-muted" : "text-foreground")}>
              {stage.label}
            </span>
          </div>
          <div className="hidden sm:flex items-center w-full">
            {i > 0 && (
              <span
                className={cn(
                  "h-0.5 flex-1",
                  stages[i - 1].status === "upcoming" ? "bg-border" : "bg-navy"
                )}
              />
            )}
            <StageDot status={stage.status} />
            {i < stages.length - 1 && (
              <span className={cn("h-0.5 flex-1", stage.status === "done" ? "bg-navy" : "bg-border")} />
            )}
          </div>
          <span className={cn("hidden sm:block text-[11px] text-center font-medium mt-1", stage.status === "upcoming" ? "text-muted" : "text-foreground")}>
            {stage.label}
          </span>
        </li>
      ))}
    </ol>
  );
}

function StageDot({ status }: { status: "done" | "current" | "upcoming" }) {
  return (
    <span
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ring-4 ring-background",
        status === "done" && "bg-navy text-white",
        status === "current" && "bg-amber text-white",
        status === "upcoming" && "bg-muted-bg text-muted border border-border"
      )}
    >
      {status === "done" ? <Check className="size-3.5" /> : null}
    </span>
  );
}
