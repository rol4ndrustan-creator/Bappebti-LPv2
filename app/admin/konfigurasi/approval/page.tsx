"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CONFIG_CHANGE_REQUESTS } from "@/lib/mock-data";
import { useConfigChangeRequests, decideConfigChange } from "@/lib/mock-service/config-approval-store";
import { ConfigChangeRequest, ConfigType } from "@/lib/types";
import { useToast } from "@/components/shared/toast-provider";
import { CheckCircle2, XCircle, ClipboardCheck, Eye } from "lucide-react";
import type { VariantProps } from "class-variance-authority";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

const CONFIG_TYPES: ConfigType[] = ["Kategori Pengaduan", "Manajemen SLA", "Kategori Ekosistem"];

function statusVariant(status: ConfigChangeRequest["status"]): BadgeVariant {
  switch (status) {
    case "Menunggu":
      return "amber";
    case "Disetujui":
      return "green";
    case "Ditolak":
      return "red";
  }
}

function RequestTable({
  requests,
  showActions,
  onView,
  onDecide,
}: {
  requests: ConfigChangeRequest[];
  showActions: boolean;
  onView: (request: ConfigChangeRequest) => void;
  onDecide: (request: ConfigChangeRequest, approve: boolean) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Jenis Konfigurasi</TableHead>
          <TableHead>Aksi</TableHead>
          <TableHead>Item</TableHead>
          <TableHead>Sebelum</TableHead>
          <TableHead>Sesudah</TableHead>
          <TableHead>Diajukan Oleh</TableHead>
          <TableHead>Tanggal</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Aksi Approval</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((r) => (
          <TableRow key={r.id}>
            <TableCell className="font-medium text-navy whitespace-nowrap">{r.id}</TableCell>
            <TableCell className="whitespace-nowrap">{r.configType}</TableCell>
            <TableCell className="whitespace-nowrap">{r.action}</TableCell>
            <TableCell className="max-w-[200px]">{r.itemLabel}</TableCell>
            <TableCell className="text-muted whitespace-nowrap">{r.beforeValue || "-"}</TableCell>
            <TableCell className="font-medium whitespace-nowrap">{r.afterValue}</TableCell>
            <TableCell className="text-muted whitespace-nowrap">{r.requestedBy}</TableCell>
            <TableCell className="text-muted whitespace-nowrap">{r.requestedAt}</TableCell>
            <TableCell>
              <Badge variant={statusVariant(r.status)}>{r.status.toUpperCase()}</Badge>
              {r.status !== "Menunggu" && (
                <div className="text-[11px] text-muted mt-0.5">
                  oleh {r.decidedBy} &middot; {r.decidedAt}
                  {r.reason && <> &mdash; {r.reason}</>}
                </div>
              )}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1.5">
                <Button size="sm" variant="outline" onClick={() => onView(r)}>
                  <Eye className="size-3.5" /> Detail
                </Button>
                {showActions && (
                  <>
                    <Button size="sm" variant="success" onClick={() => onDecide(r, true)}>
                      <CheckCircle2 className="size-3.5" /> Setujui
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => onDecide(r, false)}>
                      <XCircle className="size-3.5" /> Tolak
                    </Button>
                  </>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
        {requests.length === 0 && (
          <TableRow>
            <TableCell colSpan={10} className="text-center text-muted py-6">
              Tidak ada permohonan yang sesuai.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

function payloadEntries(payload: string): [string, string][] {
  try {
    const data = JSON.parse(payload) as Record<string, unknown>;
    return Object.entries(data).map(([k, v]) => [k, v === undefined || v === null || v === "" ? "-" : String(v)]);
  } catch {
    return [];
  }
}

export default function ApprovalConfigurationPage() {
  const requests = useConfigChangeRequests(CONFIG_CHANGE_REQUESTS);
  const { showToast } = useToast();

  const [typeFilter, setTypeFilter] = React.useState("");
  const pending = requests.filter((r) => r.status === "Menunggu");
  const filteredAll = requests.filter((r) => !typeFilter || r.configType === typeFilter);

  const [viewing, setViewing] = React.useState<ConfigChangeRequest | null>(null);
  const [decisionTarget, setDecisionTarget] = React.useState<{ request: ConfigChangeRequest; approve: boolean } | null>(null);
  const [reason, setReason] = React.useState("");

  function openDecision(request: ConfigChangeRequest, approve: boolean) {
    setDecisionTarget({ request, approve });
    setReason("");
  }

  function confirmDecision() {
    if (!decisionTarget) return;
    const { request, approve } = decisionTarget;
    decideConfigChange(request, approve ? "Disetujui" : "Ditolak", "Anda (Petugas Admin)", reason.trim() || undefined);
    showToast(`${request.id} telah ${approve ? "disetujui dan diterapkan" : "ditolak"}.`);
    setDecisionTarget(null);
  }

  return (
    <div>
      <PageHeader
        title="Approval Configuration"
        description="Setiap perubahan konfigurasi (Kategori Pengaduan, Manajemen SLA, Kategori Ekosistem) wajib melalui persetujuan di sini sebelum berlaku."
      />

      <Tabs defaultValue="perlu-tindakan">
        <TabsList>
          <TabsTrigger value="perlu-tindakan">
            <ClipboardCheck className="size-3.5" /> Perlu Tindakan ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="semua">Riwayat Perubahan ({requests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="perlu-tindakan">
          <RequestTable requests={pending} showActions onView={setViewing} onDecide={openDecision} />
        </TabsContent>

        <TabsContent value="semua">
          <div className="mb-3 flex flex-wrap items-end gap-2">
            <div className="w-56">
              <Label>Jenis Konfigurasi</Label>
              <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="">Semua jenis</option>
                {CONFIG_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Select>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setTypeFilter("")}>Reset Filter</Button>
          </div>
          <RequestTable requests={filteredAll} showActions={false} onView={setViewing} onDecide={openDecision} />
        </TabsContent>
      </Tabs>

      <Dialog open={!!viewing} onOpenChange={(v) => !v && setViewing(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Detail Pengajuan — {viewing?.id}</DialogTitle>
            <DialogDescription>{viewing?.configType} &middot; {viewing?.action}</DialogDescription>
          </DialogHeader>
          {viewing && (
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div><dt className="text-muted">Item</dt><dd className="font-medium">{viewing.itemLabel}</dd></div>
              <div><dt className="text-muted">Diajukan Oleh</dt><dd className="font-medium">{viewing.requestedBy}</dd></div>
              <div><dt className="text-muted">Sebelum</dt><dd className="font-medium">{viewing.beforeValue || "-"}</dd></div>
              <div><dt className="text-muted">Sesudah</dt><dd className="font-medium">{viewing.afterValue}</dd></div>
              <div><dt className="text-muted">Tanggal Pengajuan</dt><dd className="font-medium">{viewing.requestedAt}</dd></div>
              <div><dt className="text-muted">Status</dt><dd><Badge variant={statusVariant(viewing.status)}>{viewing.status.toUpperCase()}</Badge></dd></div>
              {viewing.status !== "Menunggu" && (
                <>
                  <div><dt className="text-muted">Diputuskan Oleh</dt><dd className="font-medium">{viewing.decidedBy}</dd></div>
                  <div><dt className="text-muted">Tanggal Keputusan</dt><dd className="font-medium">{viewing.decidedAt}</dd></div>
                  {viewing.reason && (
                    <div className="sm:col-span-2"><dt className="text-muted">Alasan</dt><dd className="font-medium">{viewing.reason}</dd></div>
                  )}
                </>
              )}
              <div className="sm:col-span-2">
                <dt className="text-muted mb-1">Detail Payload</dt>
                <dd className="rounded-md border border-border bg-muted-bg p-2 space-y-0.5">
                  {payloadEntries(viewing.payload).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3">
                      <span className="text-muted">{k}</span>
                      <span className="font-medium text-right">{v}</span>
                    </div>
                  ))}
                </dd>
              </div>
            </dl>
          )}
          <DialogFooter>
            <Button size="sm" variant="secondary" onClick={() => setViewing(null)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!decisionTarget} onOpenChange={(v) => !v && setDecisionTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{decisionTarget?.approve ? "Setujui Perubahan" : "Tolak Perubahan"}</DialogTitle>
            <DialogDescription>
              {decisionTarget?.request.id} — {decisionTarget?.request.configType}: {decisionTarget?.request.itemLabel}
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="config-decision-reason">
              Alasan {decisionTarget?.approve ? "(opsional)" : "(wajib diisi)"}
            </Label>
            <Textarea id="config-decision-reason" value={reason} onChange={(e) => setReason(e.target.value)} className="min-h-[70px] text-xs" />
          </div>
          <DialogFooter>
            <Button size="sm" variant="secondary" onClick={() => setDecisionTarget(null)}>Batal</Button>
            <Button
              size="sm"
              variant={decisionTarget?.approve ? "success" : "destructive"}
              disabled={!decisionTarget?.approve && !reason.trim()}
              onClick={confirmDecision}
            >
              {decisionTarget?.approve ? "Konfirmasi Setuju" : "Konfirmasi Tolak"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
