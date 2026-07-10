import { SlaClock } from "@/lib/types";
import { getSlaTone } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Pause } from "lucide-react";

export function SlaClockCard({ clock }: { clock: SlaClock }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-border px-2.5 py-2 text-xs">
      <div className="min-w-0">
        <p className="font-medium truncate">{clock.type}</p>
        <p className="text-[11px] text-muted">
          {clock.paused ? `Dijeda: ${clock.pauseReason ?? "-"}` : `Batas waktu: ${clock.deadline}`}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {clock.paused && <Pause className="size-3 text-muted" />}
        <Badge variant={getSlaTone(clock.status)}>{clock.status.toUpperCase()}</Badge>
      </div>
    </div>
  );
}

export function SlaSummary({ clocks }: { clocks: SlaClock[] }) {
  if (clocks.length === 0) {
    return <p className="text-xs text-muted">Belum ada SLA aktif untuk kasus ini.</p>;
  }
  return (
    <div className="flex flex-col gap-1.5">
      {clocks.map((c) => (
        <SlaClockCard key={c.type} clock={c} />
      ))}
    </div>
  );
}
