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
import { PLATFORM_STAFF, ROLE_LABEL } from "@/lib/permissions";
import { Plus } from "lucide-react";

export default function ManajemenTugasPage() {
  const { user } = useDemoSession();
  const { showToast } = useToast();
  const isSupervisor = user.role === "PLATFORM_SUPERVISOR";

  const platformCases = useCasesData(useMemo(() => CASES.filter((c) => c.currentOwner === "Platform"), []));
  const allTasks = useAllTasks(CASE_TASKS);

  const platformStaffNames = useMemo(() => new Set(PLATFORM_STAFF.map((s) => s.name)), []);
  const platformTasks = useMemo(
    () => allTasks.filter((t) => t.createdByRole === "Platform" || platformStaffNames.has(t.assignee) || platformStaffNames.has(t.createdBy)),
    [allTasks, platformStaffNames]
  );

  // Role-scoped visibility (Bab II): CS only sees tasks delegated to them;
  // Admin/Supervisor monitors every task from all platform staff.
  const tasks = isSupervisor ? platformTasks : platformTasks.filter((t) => t.assignee === user.name);

  const [addOpen, setAddOpen] = useState(false);
  const [ticket, setTicket] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState(PLATFORM_STAFF[0]?.name ?? "");
  const [document, setDocument] = useState("");

  function resetForm() {
    setTicket("");
    setDescription("");
    setAssignee(PLATFORM_STAFF[0]?.name ?? "");
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
        description={
          isSupervisor
            ? "Pantau seluruh tugas internal yang didelegasikan kepada staf platform."
            : "Daftar tugas internal yang didelegasikan kepada Anda."
        }
        actions={
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="size-3.5" /> Tambah Tugas
          </Button>
        }
      />

      <TaskTable
        tasks={tasks}
        currentUserName={user.name}
        caseDetailPath={(ticket) => `/platform/kasus/${ticket}`}
        emptyMessage={isSupervisor ? "Belum ada tugas internal." : "Belum ada tugas yang didelegasikan kepada Anda."}
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
                {platformCases.map((c) => (
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
                {PLATFORM_STAFF.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
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
