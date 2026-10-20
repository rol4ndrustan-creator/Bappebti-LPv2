"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { APPROVAL_REQUESTS } from "@/lib/mock-data";
import { ApprovalRequest, ApprovalRequestType } from "@/lib/types";
import { useApprovalRequests, decideApproval } from "@/lib/mock-service/approval-store";
import { useToast } from "@/components/shared/toast-provider";
import { CheckCircle2, XCircle, ClipboardCheck } from "lucide-react";
import type { VariantProps } from "class-variance-authority";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

const REQUEST_TYPES: ApprovalRequestType[] = [
  "Pendaftaran Akun Baru",
  "Perubahan Email",
  "Reset Password",
  "Perubahan Role",
  "Penonaktifan Akun",
];

function statusVariant(status: ApprovalRequest["status"]): BadgeVariant {
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
  onDecide,
}: {
  requests: ApprovalRequest[];
  showActions: boolean;
  onDecide: (request: ApprovalRequest, approve: boolean) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Jenis Permohonan</TableHead>
          <TableHead>Target User</TableHead>
          <TableHead>Deskripsi Perubahan</TableHead>
          <TableHead>Diajukan Oleh</TableHead>
          <TableHead>Tanggal</TableHead>
          <TableHead>Status</TableHead>
          {showActions && <TableHead>Aksi</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((r) => (
          <TableRow key={r.id}>
            <TableCell className="font-medium text-navy whitespace-nowrap">{r.id}</TableCell>
            <TableCell className="whitespace-nowrap">{r.requestType}</TableCell>
            <TableCell className="whitespace-nowrap">
              <div>{r.targetUserName}</div>
              <div className="text-[11px] text-muted">{r.targetUserEmail}</div>
            </TableCell>
            <TableCell className="max-w-[280px]">{r.description}</TableCell>
            <TableCell className="whitespace-nowrap text-muted">{r.requestedBy}</TableCell>
            <TableCell className="whitespace-nowrap text-muted">{r.requestedAt}</TableCell>
            <TableCell>
              <Badge variant={statusVariant(r.status)}>{r.status.toUpperCase()}</Badge>
              {r.status !== "Menunggu" && (
                <div className="text-[11px] text-muted mt-0.5">
                  oleh {r.decidedBy} &middot; {r.decidedAt}
                  {r.reason && <> &mdash; {r.reason}</>}
                </div>
              )}
            </TableCell>
            {showActions && (
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <Button size="sm" variant="success" onClick={() => onDecide(r, true)}>
                    <CheckCircle2 className="size-3.5" /> Setujui
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => onDecide(r, false)}>
                    <XCircle className="size-3.5" /> Tolak
                  </Button>
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
        {requests.length === 0 && (
          <TableRow>
            <TableCell colSpan={showActions ? 8 : 7} className="text-center text-muted py-6">
              Tidak ada permohonan yang sesuai.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export default function ApprovalUserRolePage() {
  const requests = useApprovalRequests(APPROVAL_REQUESTS);
  const { showToast } = useToast();

  const [typeFilter, setTypeFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [keyword, setKeyword] = React.useState("");

  const [decisionTarget, setDecisionTarget] = React.useState<{ request: ApprovalRequest; approve: boolean } | null>(null);
  const [reason, setReason] = React.useState("");

  const pending = requests.filter((r) => r.status === "Menunggu");

  const filteredAll = requests.filter((r) => {
    const matchesType = !typeFilter || r.requestType === typeFilter;
    const matchesStatus = !statusFilter || r.status === statusFilter;
    const matchesKeyword =
      !keyword ||
      r.targetUserName.toLowerCase().includes(keyword.toLowerCase()) ||
      r.targetUserEmail.toLowerCase().includes(keyword.toLowerCase()) ||
      r.description.toLowerCase().includes(keyword.toLowerCase());
    return matchesType && matchesStatus && matchesKeyword;
  });

  function openDecision(request: ApprovalRequest, approve: boolean) {
    setDecisionTarget({ request, approve });
    setReason("");
  }

  function confirmDecision() {
    if (!decisionTarget) return;
    const { request, approve } = decisionTarget;
    decideApproval(request.id, approve ? "Disetujui" : "Ditolak", "Anda (Petugas Admin)", reason.trim() || undefined);
    showToast(`${request.id} telah ${approve ? "disetujui" : "ditolak"}.`);
    setDecisionTarget(null);
  }

  return (
    <div>
      <PageHeader
        title="Approval User & Role"
        description="Tinjau dan putuskan permohonan terkait akun pengguna: pendaftaran baru, perubahan email, reset password, perubahan role, dan penonaktifan akun."
      />

      <Tabs defaultValue="perlu-tindakan">
        <TabsList>
          <TabsTrigger value="perlu-tindakan">
            <ClipboardCheck className="size-3.5" /> Perlu Tindakan ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="semua">Semua Permohonan ({requests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="perlu-tindakan">
          <RequestTable requests={pending} showActions onDecide={openDecision} />
        </TabsContent>

        <TabsContent value="semua">
          <div className="mb-3 flex flex-wrap items-end gap-2">
            <div className="w-full max-w-xs">
              <Label>Cari</Label>
              <Input placeholder="Nama, email, atau deskripsi..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />
            </div>
            <div className="w-56">
              <Label>Jenis Permohonan</Label>
              <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="">Semua jenis</option>
                {REQUEST_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Select>
            </div>
            <div className="w-44">
              <Label>Status</Label>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">Semua status</option>
                <option value="Menunggu">Menunggu</option>
                <option value="Disetujui">Disetujui</option>
                <option value="Ditolak">Ditolak</option>
              </Select>
            </div>
            <Button variant="secondary" size="sm" onClick={() => { setKeyword(""); setTypeFilter(""); setStatusFilter(""); }}>
              Reset Filter
            </Button>
          </div>
          <RequestTable requests={filteredAll} showActions={false} onDecide={openDecision} />
        </TabsContent>
      </Tabs>

      <Dialog open={!!decisionTarget} onOpenChange={(v) => !v && setDecisionTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{decisionTarget?.approve ? "Setujui Permohonan" : "Tolak Permohonan"}</DialogTitle>
            <DialogDescription>
              {decisionTarget?.request.id} — {decisionTarget?.request.requestType} untuk {decisionTarget?.request.targetUserName}
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="decision-reason">
              Alasan {decisionTarget?.approve ? "(opsional)" : "(wajib diisi)"}
            </Label>
            <Textarea id="decision-reason" value={reason} onChange={(e) => setReason(e.target.value)} className="min-h-[70px] text-xs" />
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
