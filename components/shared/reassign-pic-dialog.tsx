"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { PLATFORM_LIST, BURSA_LIST, KLIRING_LIST } from "@/lib/mock-data";
import { DEMO_USERS } from "@/lib/permissions";
import { OwnerType } from "@/lib/types";

interface PicOption {
  value: string;
  owner: OwnerType;
  name: string;
  groupLabel: string;
}

const BAPPEBTI_STAFF_OPTIONS: PicOption[] = DEMO_USERS.filter((u) => u.role.startsWith("BAPPEBTI_")).map((u) => ({
  value: `bappebti:${u.name}`,
  owner: "Bappebti",
  name: u.name,
  groupLabel: "Internal Bappebti",
}));

const PLATFORM_OPTIONS: PicOption[] = PLATFORM_LIST.filter((p) => p !== "Tidak tahu / belum terdaftar").map((p) => ({
  value: `platform:${p}`,
  owner: "Platform",
  name: p,
  groupLabel: "Platform",
}));

const BURSA_OPTIONS_LIST: PicOption[] = BURSA_LIST.map((b) => ({
  value: `bursa:${b}`,
  owner: "Bursa",
  name: b,
  groupLabel: "Bursa",
}));

const KLIRING_OPTIONS_LIST: PicOption[] = KLIRING_LIST.map((k) => ({
  value: `kliring:${k}`,
  owner: "Kliring",
  name: k,
  groupLabel: "Kliring",
}));

const PIC_GROUPS: { label: string; options: PicOption[] }[] = [
  { label: "Internal Bappebti", options: BAPPEBTI_STAFF_OPTIONS },
  { label: "Platform", options: PLATFORM_OPTIONS },
  { label: "Bursa", options: BURSA_OPTIONS_LIST },
  { label: "Kliring", options: KLIRING_OPTIONS_LIST },
];

const ALL_PIC_OPTIONS = PIC_GROUPS.flatMap((g) => g.options);

/**
 * Reassigns the case's current owner/PIC to internal Bappebti staff, a
 * platform, a bursa, or a kliring entity (Section: Alihkan Penanggung Jawab).
 */
export function ReassignPicDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (owner: OwnerType, picName: string, reason: string) => void;
}) {
  const [selected, setSelected] = React.useState("");
  const [reason, setReason] = React.useState("");

  function reset() {
    setSelected("");
    setReason("");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alihkan Penanggung Jawab (PIC)</DialogTitle>
          <DialogDescription>
            Petugas atau unit yang bertanggung jawab menangani kasus ini di internal Bappebti akan diganti,
            atau kasus dapat dialihkan kembali ke platform maupun ke ekosistem (bursa/kliring).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="pic-new">PIC baru</Label>
            <Select id="pic-new" value={selected} onChange={(e) => setSelected(e.target.value)}>
              <option value="">Pilih PIC baru...</option>
              {PIC_GROUPS.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pic-reason">Alasan pengalihan</Label>
            <Textarea
              id="pic-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Jelaskan alasan pengalihan PIC ini untuk keperluan audit..."
              className="min-h-[80px] text-sm"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            size="sm"
            disabled={!selected || !reason.trim()}
            onClick={() => {
              const opt = ALL_PIC_OPTIONS.find((o) => o.value === selected);
              if (!opt) return;
              onConfirm(opt.owner, opt.name, reason.trim());
              reset();
              onOpenChange(false);
            }}
          >
            Alihkan PIC
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
