"use client";

import { PageHeader } from "@/components/shared/page-header";
import { TaskTable } from "@/components/shared/task-table";
import { CASE_TASKS } from "@/lib/mock-data";
import { useAllTasks } from "@/lib/mock-service/task-store";
import { useDemoSession } from "@/lib/demo-session";

export default function EkosistemPengawasTugasPage() {
  const { user } = useDemoSession();
  const tasks = useAllTasks(CASE_TASKS);

  return (
    <div>
      <PageHeader
        title="Manajemen Tugas"
        description="Pemantauan progres tindak lanjut tugas internal secara read-only untuk keperluan pengawasan kepatuhan."
      />

      <TaskTable
        tasks={tasks}
        currentUserName={user.name}
        caseDetailPath={(ticket) => `/ekosistem/pengawas/kasus/${ticket}`}
        readOnly
        emptyMessage="Belum ada tugas internal yang tercatat."
      />
    </div>
  );
}
