"use client";

import { useState } from "react";
import Link from "next/link";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FileUploader } from "@/components/shared/file-uploader";
import { StatusBadgeSelect } from "@/components/shared/status-badge-select";
import { useToast } from "@/components/shared/toast-provider";
import { updateTaskStatus, updateTaskDocument, deleteTask } from "@/lib/mock-service/task-store";
import { CaseTask } from "@/lib/types";
import { FileText, Upload, Trash2 } from "lucide-react";

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
  emptyMessage,
}: {
  tasks: CaseTask[];
  currentUserName: string;
  caseDetailPath: (ticket: string) => string;
  /** Forces every row to read-only regardless of creator/assignee — for Ekosistem Pengawas's oversight-only monitoring. */
  readOnly?: boolean;
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
            <TableHead>Dari Siapa</TableHead>
            <TableHead>Assignee</TableHead>
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
                  <Link href={caseDetailPath(t.ticket)} className="font-medium text-navy hover:underline">
                    {t.ticket}
                  </Link>
                </TableCell>
                <TableCell className="max-w-[260px]">{t.description}</TableCell>
                <TableCell className="text-muted whitespace-nowrap">{t.createdBy}</TableCell>
                <TableCell className="whitespace-nowrap">{t.assignee}</TableCell>
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
