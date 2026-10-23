"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { CaseTaskStatus } from "@/lib/types";

const STATUS_CLASS: Record<CaseTaskStatus, string> = {
  Pending: "bg-muted-bg text-muted border-transparent",
  "In Progress": "bg-amber-bg text-amber border-amber/30",
  Done: "bg-green-bg text-green border-green/30",
};

const STATUSES: CaseTaskStatus[] = ["Pending", "In Progress", "Done"];

/**
 * A status control styled as a colored badge pill. Editable rows render a
 * real <select> sized and clipped to the pill itself (not the generic form
 * <Select>, whose fixed h-9/pr-8 sizing is built for inputs and overflows a
 * compact table cell); read-only rows render the same pill as plain text.
 */
export function StatusBadgeSelect({
  value,
  onChange,
  editable,
}: {
  value: CaseTaskStatus;
  onChange?: (status: CaseTaskStatus) => void;
  editable: boolean;
}) {
  if (!editable) {
    return (
      <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium", STATUS_CLASS[value])}>
        {value}
      </span>
    );
  }

  return (
    <span className={cn("relative inline-flex items-center rounded-md border text-xs font-medium", STATUS_CLASS[value])}>
      <select
        aria-label="Ubah status tugas"
        value={value}
        onChange={(e) => onChange?.(e.target.value as CaseTaskStatus)}
        className="appearance-none bg-transparent pl-2 pr-5 py-0.5 text-xs font-medium outline-none cursor-pointer"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s} className="text-foreground">
            {s}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-1.5 size-3" />
    </span>
  );
}
