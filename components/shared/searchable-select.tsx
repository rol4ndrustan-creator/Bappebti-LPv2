"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchableSelectGroup {
  label: string;
  options: string[];
}

export function SearchableSelect({
  id,
  value,
  onChange,
  groups,
  placeholder = "Pilih...",
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  groups: SearchableSelectGroup[];
  placeholder?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  React.useEffect(() => {
    if (open) {
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open]);

  const q = query.trim().toLowerCase();
  const filteredGroups = groups
    .map((g) => ({ label: g.label, options: g.options.filter((o) => o.toLowerCase().includes(q)) }))
    .filter((g) => g.options.length > 0);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        id={id}
        onClick={() => {
          setQuery("");
          setOpen((v) => !v);
        }}
        className="flex h-9 w-full items-center justify-between rounded-md border border-border bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/30"
      >
        <span className={cn("truncate text-left", !value && "text-muted")}>{value || placeholder}</span>
        <ChevronDown className="size-4 shrink-0 text-muted ml-2" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-white shadow-lg">
          <div className="p-1.5 border-b border-border">
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari..."
              className="w-full rounded-md border border-border px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/30"
            />
          </div>
          <div className="max-h-52 overflow-y-auto py-1">
            {filteredGroups.length === 0 && <p className="px-3 py-2 text-xs text-muted">Tidak ditemukan.</p>}
            {filteredGroups.map((g) => (
              <div key={g.label || "_"}>
                {g.label && <p className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase text-muted">{g.label}</p>}
                {g.options.map((opt) => (
                  <button
                    type="button"
                    key={opt}
                    title={opt}
                    onClick={() => {
                      onChange(opt);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-muted-bg/60",
                      opt === value && "bg-muted-bg/40 font-medium"
                    )}
                  >
                    <span className="truncate">{opt}</span>
                    {opt === value && <Check className="size-3.5 shrink-0 ml-auto text-navy" />}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
