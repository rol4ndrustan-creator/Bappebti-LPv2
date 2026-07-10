import { FileText, Download } from "lucide-react";
import { EmptyState } from "./empty-state";

interface EvidenceEntry {
  filename: string;
  category?: string;
  uploadedBy?: string;
  date?: string;
}

export function EvidenceList({ files }: { files: (string | EvidenceEntry)[] }) {
  const entries: EvidenceEntry[] = files.map((f) => (typeof f === "string" ? { filename: f } : f));

  if (entries.length === 0) {
    return <EmptyState icon={FileText} title="Belum ada bukti yang diunggah" description="Bukti pendukung yang dilampirkan akan muncul di sini." />;
  }

  return (
    <ul className="flex flex-col gap-2">
      {entries.map((e, idx) => (
        <li key={idx} className="flex items-center gap-3 rounded-md border border-border px-3 py-2 text-xs">
          <FileText className="size-4 text-navy shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{e.filename}</p>
            <p className="text-[11px] text-muted">
              {[e.category, e.uploadedBy, e.date].filter(Boolean).join(" · ") || "Bukti pendukung"}
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-navy hover:underline shrink-0"
            title="Prototipe: unduhan tidak tersedia"
          >
            <Download className="size-3.5" /> Unduh
          </button>
        </li>
      ))}
    </ul>
  );
}
