"use client";

import * as React from "react";
import { ClarificationRequest } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { formatMockDateTime } from "@/lib/clarification-workflow";

type ReviewAction = "accept" | "revision" | "more-info" | "partial";

/**
 * Section 12 — the requesting party reviews a submitted response: accept &
 * complete, request revision (with reason + new deadline), request
 * additional information (adds a follow-up without overwriting the original
 * question), or mark partially complete.
 */
export function ClarificationReviewPanel({
  clarification,
  onAccept,
  onRequestRevision,
  onRequestMoreInfo,
  onMarkPartial,
}: {
  clarification: ClarificationRequest;
  onAccept: (note?: string) => void;
  onRequestRevision: (reason: string, requiredCorrections: string, newDueAt: string) => void;
  onRequestMoreInfo: (question: string) => void;
  onMarkPartial: (note: string) => void;
}) {
  const [active, setActive] = React.useState<ReviewAction | null>(null);
  const [note, setNote] = React.useState("");
  const [correction, setCorrection] = React.useState("");
  const [newDueAt, setNewDueAt] = React.useState("");

  function close() {
    setActive(null);
    setNote("");
    setCorrection("");
    setNewDueAt("");
  }

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted mb-2">Tinjau Respons</p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="success" onClick={() => setActive("accept")}>
          Terima &amp; Selesaikan
        </Button>
        <Button size="sm" variant="destructive" onClick={() => setActive("revision")}>
          Minta Perbaikan
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setActive("more-info")}>
          Minta Informasi Tambahan
        </Button>
        <Button size="sm" variant="outline" onClick={() => setActive("partial")}>
          Tandai Sebagian Lengkap
        </Button>
      </div>

      <Dialog open={active === "accept"} onOpenChange={(v) => !v && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terima Respons &amp; Selesaikan Klarifikasi</DialogTitle>
            <DialogDescription>Klarifikasi {clarification.id} akan ditandai selesai dan action owner kembali ke alur kasus.</DialogDescription>
          </DialogHeader>
          <Label htmlFor="review-note">Catatan peninjauan (opsional)</Label>
          <Textarea id="review-note" value={note} onChange={(e) => setNote(e.target.value)} className="min-h-[70px]" />
          <DialogFooter>
            <Button variant="secondary" size="sm" onClick={close}>
              Batal
            </Button>
            <Button
              size="sm"
              onClick={() => {
                onAccept(note.trim() || undefined);
                close();
              }}
            >
              Konfirmasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={active === "revision"} onOpenChange={(v) => !v && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Minta Perbaikan Respons</DialogTitle>
            <DialogDescription>Jelaskan kekurangan respons dan perbaikan yang diperlukan.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <div>
              <Label htmlFor="rev-reason">Alasan (wajib)</Label>
              <Textarea id="rev-reason" value={note} onChange={(e) => setNote(e.target.value)} className="min-h-[70px]" />
            </div>
            <div>
              <Label htmlFor="rev-correction">Perbaikan yang diperlukan (wajib)</Label>
              <Textarea id="rev-correction" value={correction} onChange={(e) => setCorrection(e.target.value)} className="min-h-[60px]" />
            </div>
            <div>
              <Label htmlFor="rev-due">Batas waktu baru (wajib)</Label>
              <Input id="rev-due" type="datetime-local" value={newDueAt} onChange={(e) => setNewDueAt(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" size="sm" onClick={close}>
              Batal
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={!note.trim() || !correction.trim() || !newDueAt.trim()}
              onClick={() => {
                onRequestRevision(note.trim(), correction.trim(), formatMockDateTime(new Date(newDueAt)));
                close();
              }}
            >
              Kirim Permintaan Perbaikan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={active === "more-info"} onOpenChange={(v) => !v && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Minta Informasi Tambahan</DialogTitle>
            <DialogDescription>Pertanyaan lanjutan ditambahkan ke riwayat tanpa mengganti pertanyaan asli.</DialogDescription>
          </DialogHeader>
          <Label htmlFor="more-info-q">Pertanyaan lanjutan</Label>
          <Textarea id="more-info-q" value={note} onChange={(e) => setNote(e.target.value)} className="min-h-[80px]" />
          <DialogFooter>
            <Button variant="secondary" size="sm" onClick={close}>
              Batal
            </Button>
            <Button
              size="sm"
              disabled={!note.trim()}
              onClick={() => {
                onRequestMoreInfo(note.trim());
                close();
              }}
            >
              Kirim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={active === "partial"} onOpenChange={(v) => !v && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tandai Sebagian Lengkap</DialogTitle>
            <DialogDescription>Gunakan bila sebagian jawaban sudah memadai namun sebagian lagi masih diperlukan.</DialogDescription>
          </DialogHeader>
          <Label htmlFor="partial-note">Catatan</Label>
          <Textarea id="partial-note" value={note} onChange={(e) => setNote(e.target.value)} className="min-h-[70px]" />
          <DialogFooter>
            <Button variant="secondary" size="sm" onClick={close}>
              Batal
            </Button>
            <Button
              size="sm"
              disabled={!note.trim()}
              onClick={() => {
                onMarkPartial(note.trim());
                close();
              }}
            >
              Konfirmasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
