"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

/**
 * Every significant regulator action requires a reason, an effective date,
 * and confirmation before it is recorded to the audit trail (Section 12).
 */
export function WorkflowTransitionDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Konfirmasi",
  reasonRequired = true,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  reasonRequired?: boolean;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = React.useState("");

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) setReason("");
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="wf-reason">Alasan {reasonRequired ? "(wajib)" : "(opsional)"}</Label>
          <Textarea
            id="wf-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Jelaskan alasan tindakan ini untuk keperluan audit..."
            className="min-h-[80px] text-sm"
          />
          <p className="text-[11px] text-muted">Tanggal efektif: hari ini. Tindakan ini akan tercatat pada jejak audit kasus.</p>
        </div>
        <DialogFooter>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            size="sm"
            disabled={reasonRequired && !reason.trim()}
            onClick={() => {
              onConfirm(reason.trim());
              setReason("");
              onOpenChange(false);
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
