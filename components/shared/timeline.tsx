import { TimelineEvent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CheckCircle2, Info, AlertTriangle, XCircle } from "lucide-react";

const iconMap = {
  success: { icon: CheckCircle2, cls: "text-green bg-green-bg" },
  info: { icon: Info, cls: "text-navy bg-navy/10" },
  warning: { icon: AlertTriangle, cls: "text-amber bg-amber-bg" },
  danger: { icon: XCircle, cls: "text-red bg-red-bg" },
};

export function CaseTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="relative border-l border-border ml-3">
      {events.map((e, idx) => {
        const { icon: Icon, cls } = iconMap[e.status];
        return (
          <li key={idx} className="mb-5 ml-5 last:mb-0">
            <span
              className={cn(
                "absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ring-2 ring-card",
                cls
              )}
            >
              <Icon className="size-3.5" />
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium">{e.action}</p>
              <span className="text-[11px] text-muted">{e.datetime}</span>
            </div>
            <p className="text-xs text-muted mt-0.5">
              {e.actor} <span className="text-muted/70">&middot; {e.role}</span>
            </p>
            {e.note && <p className="text-xs mt-1 text-foreground/80">{e.note}</p>}
          </li>
        );
      })}
    </ol>
  );
}
