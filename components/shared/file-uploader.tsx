"use client";

import * as React from "react";
import { Upload, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Standard drag-and-drop / click-to-select file uploader used across the
 * app (public complaint submission, Bukti tab, Tugas Internal). No real
 * upload happens — this is a demo prototype with no backend — but it's a
 * genuinely working picker: selecting or dropping files captures their
 * real filenames, which is what every "evidence"/"document" field in this
 * app stores.
 */
export function FileUploader({
  files,
  onChange,
  accept = ".pdf,.jpg,.jpeg,.png",
  maxFiles = 5,
  multiple = true,
  hint,
  label = "Seret file ke sini atau klik untuk memilih",
}: {
  files: string[];
  onChange: (files: string[]) => void;
  accept?: string;
  maxFiles?: number;
  multiple?: boolean;
  hint?: string;
  label?: string;
}) {
  const inputId = React.useId();
  const [dragOver, setDragOver] = React.useState(false);

  function addFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    const names = Array.from(list).map((f) => f.name);
    const merged = Array.from(new Set([...files, ...names])).slice(0, maxFiles);
    onChange(merged);
  }

  const formatHint = accept
    .split(",")
    .map((ext) => ext.replace(".", "").toUpperCase())
    .join(", ");

  return (
    <div className="flex flex-col gap-3">
      <div
        role="button"
        tabIndex={0}
        onClick={() => document.getElementById(inputId)?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") document.getElementById(inputId)?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "rounded-md border-2 border-dashed p-8 text-center cursor-pointer transition-colors",
          dragOver ? "border-navy bg-navy/5" : "border-border hover:border-navy/40"
        )}
      >
        <input
          id={inputId}
          type="file"
          multiple={multiple}
          accept={accept}
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
        <Upload className="size-7 text-muted mx-auto mb-2" />
        <p className="text-sm font-medium">{label}</p>
        <p className="text-[11px] text-muted mt-1">
          {hint ?? `${formatHint} — maksimal ${maxFiles} file`}
        </p>
      </div>

      {files.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-navy mb-2">File terlampir</p>
          <ul className="flex flex-col gap-2">
            {files.map((file) => (
              <li key={file} className="flex items-center gap-2 rounded-md border border-border p-2.5 text-xs">
                <FileText className="size-4 text-navy shrink-0" />
                <span className="flex-1 truncate">{file}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(files.filter((f) => f !== file));
                  }}
                  className="text-muted hover:text-red"
                  aria-label={`Hapus ${file}`}
                >
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
