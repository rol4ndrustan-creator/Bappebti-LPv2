"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FileUploader } from "@/components/shared/file-uploader";
import { StatusBadgeSelect } from "@/components/shared/status-badge-select";
import { useToast } from "@/components/shared/toast-provider";
import { updateTaskStatus, updateTaskDocument, deleteTask } from "@/lib/mock-service/task-store";
import { abbreviateLembaga } from "@/lib/ecosystem-lembaga";
import { CaseTask } from "@/lib/types";
import { FileText, Upload, Trash2, Pencil } from "lucide-react";

function AssigneeBadge({ task }: { task: CaseTask }) {
  const isDelegated = task.delegationType && task.delegationType !== "Internal Platform";
  const label = isDelegated ? `${task.delegationType}: ${abbreviateLembaga(task.delegationEntity ?? "")}` : "Internal";
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span
        className={cn(
          "rounded border px-1 py-0.5 text-[10px] font-semibold uppercase tracking-wide shrink-0",
          isDelegated ? "border-amber/30 bg-amber-bg text-amber" : "border-navy/20 bg-navy/10 text-navy"
        )}
      >
        {label}
      </span>
      <span>{task.assignee}</span>
    </span>
  );
}

/**
 * Shared "Manajemen Tugas" task table — used by the Platform and Ekosistem
 * Active standalone pages (editable) and the Ekosistem Pengawas page
 * (read-only monitoring). Carries the List Revisi 3 fixes: the Dokumen
 * column renders a real download link or an inline "+ Unggah" quick
 * action instead of navigating away, the Status column is a compact
 * badge-styled select instead of the oversized generic <Select>, and the
 * delete button only ever shows for the task's creator.
 */
export function TaskTable({
  tasks,
  currentUserName,
  caseDetailPath,
  readOnly = false,
  onEdit,
  lembagaColumn = false,
  emptyMessage,
}: {
  tasks: CaseTask[];
  currentUserName: string;
  caseDetailPath: (ticket: string) => string;
  /** Forces every row to read-only regardless of creator/assignee — for Ekosistem Pengawas's oversight-only monitoring. */
  readOnly?: boolean;
  /** Shows an Edit (pencil) action next to Delete, creator-only — omit to leave editing to the Tugas Internal tab only. */
  onEdit?: (task: CaseTask) => void;
  /** Swaps "Dari Siapa" for a "Lembaga" column (full institution name from delegationType/delegationEntity) and relabels Assignee as "PIC / Penerima" — for Ekosistem Active's own Manajemen Tugas, where every task already belongs to a Bursa/Kliring/Custody institution rather than being delegated out from an internal default. */
  lembagaColumn?: boolean;
  emptyMessage: string;
}) {
  const { showToast } = useToast();
  const [uploadTask, setUploadTask] = useState<CaseTask | null>(null);
  const [uploadFiles, setUploadFiles] = useState<string[]>([]);

  function closeUpload() {
    setUploadTask(null);
    setUploadFiles([]);
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nomor Tiket</TableHead>
            <TableHead>Deskripsi Tugas</TableHead>
            <TableHead>{lembagaColumn ? "Lembaga" : "Dari Siapa"}</TableHead>
            <TableHead>{lembagaColumn ? "PIC / Penerima" : "Assignee"}</TableHead>
            <TableHead>Dokumen</TableHead>
            <TableHead>Status</TableHead>
            {!readOnly && <TableHead>Aksi</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((t) => {
            const canEdit = !readOnly && (t.assignee === currentUserName || t.createdBy === currentUserName);
            const canDelete = !readOnly && t.createdBy === currentUserName;
            return (
              <TableRow key={t.id}>
                <TableCell className="whitespace-nowrap">
                  {t.ticket.startsWith("BPP-") ? (
                    <Link href={caseDetailPath(t.ticket)} className="font-medium text-navy hover:underline">
                      {t.ticket}
                    </Link>
                  ) : (
                    // Illustrative tasks not tied to a real pengaduan case (e.g. Ekosistem
                    // Active's role-switcher demo rows) have no case detail page to link to.
                    <span className="font-medium text-foreground" title="Tugas simulasi, tidak terkait kasus pengaduan">
                      {t.ticket}
                    </span>
                  )}
                </TableCell>
                <TableCell className="max-w-[260px]">{t.description}</TableCell>
                <TableCell className="text-muted whitespace-nowrap max-w-[220px] truncate">
                  {lembagaColumn ? (t.delegationEntity ? `[${t.delegationType}] ${t.delegationEntity}` : "-") : t.createdBy}
                </TableCell>
                <TableCell className="whitespace-nowrap">{lembagaColumn ? t.assignee : <AssigneeBadge task={t} />}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {t.document ? (
                    <button
                      type="button"
                      onClick={() => showToast("Unduhan dokumen bersifat simulasi pada prototipe ini.")}
                      className="inline-flex items-center gap-1 text-navy hover:underline"
                      title={t.document}
                    >
                      <FileText className="size-3.5 shrink-0" />
                      <span className="max-w-[140px] truncate">{t.document}</span>
                    </button>
                  ) : canEdit ? (
                    <button
                      type="button"
                      onClick={() => setUploadTask(t)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-navy hover:underline"
                    >
                      <Upload className="size-3.5" /> Unggah
                    </button>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <StatusBadgeSelect value={t.status} editable={canEdit} onChange={(s) => updateTaskStatus(t.id, s)} />
                </TableCell>
                {!readOnly && (
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {canDelete && onEdit && (
                        <button
                          title="Edit tugas"
                          onClick={() => onEdit(t)}
                          className="rounded p-1 text-muted hover:bg-muted-bg hover:text-navy"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          title="Hapus tugas"
                          onClick={() => {
                            deleteTask(t.id);
                            showToast("Tugas dihapus.");
                          }}
                          className="rounded p-1 text-muted hover:bg-red-bg hover:text-red"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
          {tasks.length === 0 && (
            <TableRow>
              <TableCell colSpan={readOnly ? 6 : 7} className="text-center text-muted py-6">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={!!uploadTask} onOpenChange={(v) => !v && closeUpload()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unggah Dokumen Pendukung</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-xs text-muted">
              Tugas: <span className="text-foreground font-medium">{uploadTask?.description}</span> ({uploadTask?.ticket})
            </p>
            <FileUploader files={uploadFiles} onChange={setUploadFiles} multiple={false} maxFiles={1} />
          </div>
          <DialogFooter>
            <Button size="sm" variant="secondary" onClick={closeUpload}>
              Batal
            </Button>
            <Button
              size="sm"
              disabled={uploadFiles.length === 0}
              onClick={() => {
                if (uploadTask) {
                  updateTaskDocument(uploadTask.id, uploadFiles[0]);
                  showToast("Dokumen berhasil diunggah.");
                }
                closeUpload();
              }}
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
