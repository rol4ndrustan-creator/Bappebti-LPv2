import { ClarificationAttachment } from "@/lib/types";
import { FileText, Download } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

export function ClarificationAttachmentList({ attachments }: { attachments: ClarificationAttachment[] }) {
  if (attachments.length === 0) {
    return <EmptyState icon={FileText} title="Belum ada dokumen" description="Dokumen pendukung akan muncul di sini." />;
  }

  return (
    <ul className="flex flex-col gap-2">
      {attachments.map((a) => (
        <li key={a.id} className="flex items-center gap-3 rounded-md border border-border px-3 py-2 text-xs">
          <FileText className="size-4 text-navy shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{a.filename}</p>
            <p className="text-[11px] text-muted">
              {a.category} · Diunggah oleh {a.uploadedBy} · {a.uploadedAt}
              {a.sizeLabel ? ` · ${a.sizeLabel}` : ""}
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
