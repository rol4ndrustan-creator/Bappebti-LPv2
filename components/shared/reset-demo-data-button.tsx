"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { resetDemoData } from "@/lib/mock-service/store";

/** Section 24 — a visible, explicit way to wipe every simulated action (clarifications, resolutions, closures). */
export function ResetDemoDataButton() {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-white/70 hover:bg-white/10 hover:text-white"
        title="Reset Demo Data"
      >
        <RotateCcw className="size-3.5" />
        <span className="hidden xl:inline">Reset Demo Data</span>
      </button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Demo Data</DialogTitle>
          <DialogDescription>
            Tindakan ini akan menghapus seluruh perubahan simulasi yang Anda buat selama sesi ini
            (klarifikasi, catatan internal, keputusan resolusi, penutupan kasus) dan mengembalikan
            seluruh data ke kondisi awal demo. Data asli pada skenario demo tidak akan hilang.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              resetDemoData();
              setOpen(false);
              window.location.reload();
            }}
          >
            Reset Data Demo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
