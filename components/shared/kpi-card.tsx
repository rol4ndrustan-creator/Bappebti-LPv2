import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export function KpiCard({
  label,
  value,
  icon: Icon,
  tone = "default",
  hint,
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  tone?: "default" | "amber" | "red" | "green" | "navy";
  hint?: string;
}) {
  const toneMap: Record<string, string> = {
    default: "text-foreground",
    amber: "text-amber",
    red: "text-red",
    green: "text-green",
    navy: "text-navy",
  };
  return (
    <div className="rounded-lg border border-border bg-card p-3 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted">{label}</span>
        {Icon && <Icon className={cn("size-4", toneMap[tone])} />}
      </div>
      <span className={cn("text-2xl font-semibold", toneMap[tone])}>{value}</span>
      {hint && <span className="text-[11px] text-muted">{hint}</span>}
    </div>
  );
}
