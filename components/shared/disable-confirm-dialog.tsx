"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/** Generic "are you sure" confirmation for disabling (or reactivating) a config list item, routed through an approval request. */
export function DisableConfirmDialog({
  open,
  onOpenChange,
  categoryLabel,
  itemName,
  onConfirm,
  requiresApproval = true,
  mode = "disable",
  approvalLocation = "Approval Configuration",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** e.g. "Kategori Pengaduan" */
  categoryLabel: string;
  itemName: string;
  onConfirm: () => void;
  /** Whether this change goes through an approval queue first, or applies immediately. */
  requiresApproval?: boolean;
  /** "disable" asks to deactivate, "enable" asks to reactivate a disabled item. */
  mode?: "disable" | "enable";
  /** Name of the approval submenu this change is routed to, shown in the confirmation copy. */
  approvalLocation?: string;
}) {
  const isDisable = mode === "disable";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isDisable ? "Nonaktifkan" : "Aktifkan Kembali"} {categoryLabel}</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin akan melakukan {isDisable ? "disable" : "reaktivasi"} {categoryLabel} &quot;{itemName}&quot;?{" "}
            {requiresApproval
              ? `Perubahan akan berlaku setelah disetujui pada ${approvalLocation}.`
              : "Perubahan berlaku segera."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button size="sm" variant="secondary" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button
            size="sm"
            variant={isDisable ? "destructive" : "success"}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {isDisable ? "Ya, Nonaktifkan" : "Ya, Aktifkan Kembali"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
