"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { FileUploader } from "@/components/shared/file-uploader";
import { TaskTable } from "@/components/shared/task-table";
import { CASES, CASE_TASKS } from "@/lib/mock-data";
import { useCasesData } from "@/lib/mock-service/store";
import { useAllTasks, addTask } from "@/lib/mock-service/task-store";
import { useDemoSession } from "@/lib/demo-session";
import { useToast } from "@/components/shared/toast-provider";
import { DEMO_USERS, ROLE_LABEL } from "@/lib/permissions";
import { Plus } from "lucide-react";

const ASSIGNABLE_NAMES = DEMO_USERS.filter((u) => u.role !== "PUBLIC_REPORTER" && u.role !== "PUBLIC_REPRESENTATIVE").map((u) => u.name);

export default function EkosistemActiveTugasPage() {
  const { user } = useDemoSession();
  const { showToast } = useToast();

  const coordinatedCases = useCasesData(useMemo(() => CASES.filter((c) => c.currentOwner === "Bursa" || c.currentOwner === "Kliring"), []));
  const coordinatedTickets = useMemo(() => new Set(coordinatedCases.map((c) => c.ticket)), [coordinatedCases]);
  const allTasks = useAllTasks(CASE_TASKS);
  const tasks = useMemo(() => allTasks.filter((t) => coordinatedTickets.has(t.ticket)), [allTasks, coordinatedTickets]);

  const [addOpen, setAddOpen] = useState(false);
  const [ticket, setTicket] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState(ASSIGNABLE_NAMES[0] ?? "");
  const [document, setDocument] = useState("");

  function resetForm() {
    setTicket("");
    setDescription("");
    setAssignee(ASSIGNABLE_NAMES[0] ?? "");
    setDocument("");
  }

  function submitTask() {
    if (!ticket || !description.trim() || !assignee) return;
    addTask({
      ticket,
      description: description.trim(),
      createdBy: user.name,
      createdByRole: ROLE_LABEL[user.role],
      assignee,
      document: document || undefined,
    });
    showToast("Tugas berhasil ditambahkan.");
    resetForm();
    setAddOpen(false);
  }

  return (
    <div>
      <PageHeader
        title="Manajemen Tugas"
        description="Tugas investigasi teknis yang terkait kasus-kasus yang dikoordinasikan oleh Ekosistem Active."
        actions={
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="size-3.5" /> Tambah Tugas
          </Button>
        }
      />

      <TaskTable
        tasks={tasks}
        currentUserName={user.name}
        caseDetailPath={(t) => `/ekosistem/active/kasus/${t}`}
        emptyMessage="Belum ada tugas investigasi teknis."
      />

      <Dialog open={addOpen} onOpenChange={(v) => { setAddOpen(v); if (!v) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Tugas</DialogTitle>
            <DialogDescription>Tugas akan tersinkronisasi otomatis dengan tab Tugas Internal pada detail tiket terkait.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="task-ticket">Pilih Kasus / Nomor Tiket</Label>
              <Select id="task-ticket" value={ticket} onChange={(e) => setTicket(e.target.value)}>
                <option value="">Pilih tiket...</option>
                {coordinatedCases.map((c) => (
                  <option key={c.ticket} value={c.ticket}>{c.ticket} — {c.title}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="task-desc">Task Description</Label>
              <Textarea id="task-desc" value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[70px] text-xs" />
            </div>
            <div>
              <Label htmlFor="task-assignee">Assignee</Label>
              <Select id="task-assignee" value={assignee} onChange={(e) => setAssignee(e.target.value)}>
                {ASSIGNABLE_NAMES.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="task-doc">Upload Dokumen (opsional)</Label>
              <FileUploader
                files={document ? [document] : []}
                onChange={(files) => setDocument(files[0] ?? "")}
                multiple={false}
                maxFiles={1}
                label="Klik atau seret dokumen pendukung ke sini"
              />
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" variant="secondary" onClick={() => setAddOpen(false)}>Batal</Button>
            <Button size="sm" disabled={!ticket || !description.trim()} onClick={submitTask}>Tambah Tugas</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
