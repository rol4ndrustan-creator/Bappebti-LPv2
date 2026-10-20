"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/** Generic "are you sure" confirmation for disabling a config list item, routed through an approval request. */
export function DisableConfirmDialog({
  open,
  onOpenChange,
  categoryLabel,
  itemName,
  onConfirm,
  requiresApproval = true,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** e.g. "Kategori Pengaduan" */
  categoryLabel: string;
  itemName: string;
  onConfirm: () => void;
  /** Whether this disable goes through an approval queue first, or applies immediately. */
  requiresApproval?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nonaktifkan {categoryLabel}</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin akan melakukan disable {categoryLabel} &quot;{itemName}&quot;?{" "}
            {requiresApproval
              ? "Perubahan akan berlaku setelah disetujui pada Approval Configuration."
              : "Perubahan berlaku segera."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button size="sm" variant="secondary" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Ya, Nonaktifkan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
