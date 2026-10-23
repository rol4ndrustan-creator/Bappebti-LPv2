"use client";

import * as React from "react";
import { Pencil, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/**
 * Inline PIC assignment — a dashed "+ Tugaskan PIC" ghost pill when
 * unassigned, or an avatar-initials + name + edit-pencil pill when
 * assigned. Clicking either opens a small floating popover to search and
 * pick a staff member (or clear the assignment).
 */
export function PicAssignPopover({
  currentPic,
  staff,
  onAssign,
}: {
  currentPic?: string;
  staff: { id: string; name: string }[];
  onAssign: (name: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  React.useEffect(() => {
    if (open) requestAnimationFrame(() => searchRef.current?.focus());
  }, [open]);

  const q = query.trim().toLowerCase();
  const filtered = staff.filter((s) => s.name.toLowerCase().includes(q));

  return (
    <div className="relative inline-block" ref={containerRef}>
      {currentPic ? (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setOpen((v) => !v);
          }}
          className="inline-flex items-center gap-1.5 rounded-full border border-transparent px-1.5 py-0.5 text-xs hover:border-border hover:bg-muted-bg"
        >
          <span className="flex size-5 items-center justify-center rounded-full bg-green text-white text-[10px] font-semibold shrink-0">
            {initials(currentPic)}
          </span>
          <span className="font-medium text-foreground whitespace-nowrap">{currentPic}</span>
          <Pencil className="size-3 text-muted shrink-0" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setOpen((v) => !v);
          }}
          className="inline-flex items-center gap-1 rounded-full border border-dashed border-muted/60 px-2.5 py-1 text-[11px] text-muted hover:border-navy hover:text-navy whitespace-nowrap"
        >
          <Plus className="size-3" /> Tugaskan PIC
        </button>
      )}

      {open && (
        <div className="absolute z-50 mt-1 w-56 rounded-md border border-border bg-white shadow-lg">
          <div className="p-1.5 border-b border-border">
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari staf..."
              className="w-full rounded-md border border-border px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/30"
            />
          </div>
          <div className="max-h-48 overflow-y-auto py-1">
            {filtered.length === 0 && <p className="px-3 py-2 text-xs text-muted">Tidak ditemukan.</p>}
            {filtered.map((s) => (
              <button
                type="button"
                key={s.id}
                onClick={() => {
                  onAssign(s.name);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-muted-bg",
                  s.name === currentPic && "bg-muted-bg/40 font-medium"
                )}
              >
                <span className="flex size-5 items-center justify-center rounded-full bg-navy/10 text-navy text-[10px] font-semibold shrink-0">
                  {initials(s.name)}
                </span>
                <span className="truncate">{s.name}</span>
              </button>
            ))}
            {currentPic && (
              <button
                type="button"
                onClick={() => {
                  onAssign("");
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-red hover:bg-red-bg border-t border-border mt-1"
              >
                <X className="size-3.5" /> Batalkan Penugasan
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
