"use client";

import * as React from "react";
import { ClarificationMessage } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { EmptyState } from "./empty-state";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const KIND_LABEL: Record<NonNullable<ClarificationMessage["kind"]>, { label: string; tone: "navy" | "amber" | "green" | "muted" }> = {
  info: { label: "Informasi", tone: "muted" },
  "formal-request": { label: "Permintaan Klarifikasi Resmi", tone: "amber" },
  reply: { label: "Tanggapan Pelapor", tone: "navy" },
  resolution: { label: "Komunikasi Resolusi", tone: "green" },
};

export function ClarificationThread({
  messages,
  onReply,
  replyPlaceholder = "Tulis jawaban klarifikasi Anda...",
  confirmMessage,
}: {
  messages: ClarificationMessage[];
  onReply?: (message: string) => void;
  replyPlaceholder?: string;
  /** When set, sending a message first shows a confirmation dialog with this text before calling onReply. */
  confirmMessage?: string;
}) {
  const [text, setText] = React.useState("");
  const [confirming, setConfirming] = React.useState(false);

  if (messages.length === 0 && !onReply) {
    return <EmptyState icon={MessageSquare} title="Belum ada percakapan klarifikasi" />;
  }

  function send() {
    if (!text.trim() || !onReply) return;
    onReply(text.trim());
    setText("");
    setConfirming(false);
  }

  return (
    <div className="flex flex-col gap-3">
      {messages.length === 0 && (
        <p className="text-xs text-muted">Belum ada percakapan klarifikasi untuk kasus ini.</p>
      )}
      {messages.map((m, idx) => {
        const kind = KIND_LABEL[m.kind ?? "info"];
        return (
          <div key={idx} className={cn("rounded-md border p-2.5", m.kind === "formal-request" ? "border-amber/30 bg-amber-bg/30" : "border-border")}>
            <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
              <span className="text-xs font-semibold text-navy">
                {m.from} <span className="text-muted font-normal">&middot; {m.role}</span>
              </span>
              <div className="flex items-center gap-1.5">
                <Badge variant={kind.tone}>{kind.label}</Badge>
                <span className="text-[11px] text-muted">{m.datetime}</span>
              </div>
            </div>
            <p className="text-xs text-foreground/80">{m.message}</p>
            {m.dueDate && (
              <p className="text-[11px] text-amber mt-1">Mohon ditanggapi paling lambat {m.dueDate}.</p>
            )}
            {m.requiresAttachment && (
              <p className="text-[11px] text-muted mt-0.5">Lampiran dokumen diperlukan untuk permintaan ini.</p>
            )}
          </div>
        );
      })}
      {onReply && (
        <div className="flex flex-col gap-2 pt-1">
          <Textarea
            placeholder={replyPlaceholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="text-xs min-h-[70px]"
          />
          <Button
            size="sm"
            className="self-end"
            disabled={!text.trim()}
            onClick={() => {
              if (!text.trim()) return;
              if (confirmMessage) setConfirming(true);
              else send();
            }}
          >
            Kirim Jawaban
          </Button>
        </div>
      )}

      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Pengiriman</DialogTitle>
            <DialogDescription>{confirmMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button size="sm" variant="secondary" onClick={() => setConfirming(false)}>Batal</Button>
            <Button size="sm" onClick={send}>Ya, Kirim</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
