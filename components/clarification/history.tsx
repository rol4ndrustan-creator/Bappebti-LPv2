import { ClarificationHistoryEvent } from "@/lib/types";
import { CLARIFICATION_STATUS_LABEL } from "@/lib/clarification-workflow";
import { EmptyState } from "@/components/shared/empty-state";
import { History as HistoryIcon } from "lucide-react";

const VISIBILITY_RANK: Record<ClarificationHistoryEvent["visibility"], number> = {
  public: 0,
  member: 1,
  internal: 2,
};

/** Chronological clarification audit trail (Section 13), filtered to what the viewer is allowed to see. */
export function ClarificationHistory({
  events,
  maxVisibility,
}: {
  events: ClarificationHistoryEvent[];
  maxVisibility: ClarificationHistoryEvent["visibility"];
}) {
  const visible = events.filter((e) => VISIBILITY_RANK[e.visibility] <= VISIBILITY_RANK[maxVisibility]);

  if (visible.length === 0) {
    return <EmptyState icon={HistoryIcon} title="Belum ada riwayat" description="Riwayat klarifikasi akan muncul di sini." />;
  }

  return (
    <ol className="relative border-l border-border ml-3">
      {visible.map((e) => (
        <li key={e.id} className="mb-4 ml-5 last:mb-0">
          <span className="absolute -left-1.5 flex size-3 items-center justify-center rounded-full bg-navy ring-4 ring-card" />
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium">{e.action}</p>
            <span className="text-[11px] text-muted">{e.timestamp}</span>
          </div>
          <p className="text-xs text-muted mt-0.5">
            {e.actor} <span className="text-muted/70">&middot; {e.role}</span>
            {e.institution && e.institution !== "-" ? <span className="text-muted/70"> &middot; {e.institution}</span> : null}
          </p>
          {e.note && <p className="text-xs mt-1 text-foreground/80">{e.note}</p>}
          {e.reason && <p className="text-xs mt-0.5 text-foreground/70">Alasan: {e.reason}</p>}
          {e.afterState && (
            <p className="text-[11px] text-muted mt-1">
              Status: {e.beforeState ? `${CLARIFICATION_STATUS_LABEL[e.beforeState]} → ` : ""}
              {CLARIFICATION_STATUS_LABEL[e.afterState]}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
