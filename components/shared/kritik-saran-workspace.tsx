"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { FeedbackTypeBadge } from "@/components/shared/badges";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useToast } from "@/components/shared/toast-provider";
import { FEEDBACK_LIST } from "@/lib/mock-data";
import { FeedbackItem } from "@/lib/types";
import {
  useFeedbackList,
  markFeedbackRead,
  setFeedbackFlag,
  setFeedbackFollowUp,
  setFollowUpStatus,
  setFeedbackPic,
  setFeedbackStatus,
} from "@/lib/mock-service/feedback-store";
import { Eye, Flag, Users, Mail, Phone } from "lucide-react";
import type { VariantProps } from "class-variance-authority";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

const PIC_OPTIONS = [
  "Belum ditugaskan",
  "Tim Produk Bappebti",
  "Tim Edukasi Bappebti",
  "Tim Pengawasan Bappebti",
  "Tim Operasional Bappebti",
];

const STATUS_OPTIONS: FeedbackItem["status"][] = ["Belum Ditugaskan", "Ditinjau", "Selesai", "Dikonversi"];

function statusVariant(status: FeedbackItem["status"]): BadgeVariant {
  const map: Record<FeedbackItem["status"], BadgeVariant> = {
    "Belum Ditugaskan": "muted",
    Ditinjau: "amber",
    Selesai: "green",
    Dikonversi: "navy",
  };
  return map[status];
}

export type KritikSaranMode = "all" | "unread" | "follow-up";

const MODE_HEADER: Record<KritikSaranMode, { title: string; description: string }> = {
  all: {
    title: "Daftar Kritik & Saran",
    description: "Seluruh kritik dan saran publik terkait layanan pengaduan Bappebti, beserta status tindak lanjutnya.",
  },
  unread: {
    title: "Kritik & Saran Belum Dibaca",
    description: "Kritik dan saran yang masuk namun belum ditinjau oleh petugas.",
  },
  "follow-up": {
    title: "Kritik & Saran Perlu Tindak Lanjut",
    description: "Kritik dan saran yang ditandai membutuhkan tindak lanjut, dengan status Proses atau Selesai.",
  },
};

export function KritikSaranWorkspace({ mode }: { mode: KritikSaranMode }) {
  const { showToast } = useToast();
  const allItems = useFeedbackList(FEEDBACK_LIST);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [keyword, setKeyword] = React.useState("");
  const [reporterQuery, setReporterQuery] = React.useState("");
  const [flagFilter, setFlagFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [picSelection, setPicSelection] = React.useState<string>(PIC_OPTIONS[0]);
  const [showOtherFromReporter, setShowOtherFromReporter] = React.useState(false);
  const [flagReasonDraft, setFlagReasonDraft] = React.useState("");

  const modeFiltered = React.useMemo(() => {
    if (mode === "unread") return allItems.filter((f) => !f.read);
    if (mode === "follow-up") return allItems.filter((f) => f.needsFollowUp);
    return allItems;
  }, [allItems, mode]);

  const filtered = React.useMemo(() => {
    return modeFiltered.filter((f) => {
      const matchesKeyword =
        !keyword ||
        f.topic.toLowerCase().includes(keyword.toLowerCase()) ||
        f.message.toLowerCase().includes(keyword.toLowerCase());
      const matchesReporter = !reporterQuery || f.reporterName.toLowerCase().includes(reporterQuery.toLowerCase());
      const matchesFlag = !flagFilter || (flagFilter === "flagged" ? !!f.flagged : !f.flagged);
      const matchesStatus = !statusFilter || f.status === statusFilter;
      return matchesKeyword && matchesReporter && matchesFlag && matchesStatus;
    });
  }, [modeFiltered, keyword, reporterQuery, flagFilter, statusFilter]);

  const selected = allItems.find((f) => f.id === selectedId) || null;
  const othersFromReporter = selected
    ? allItems.filter((f) => f.reporterName === selected.reporterName && f.id !== selected.id)
    : [];

  function resetFilters() {
    setKeyword("");
    setReporterQuery("");
    setFlagFilter("");
    setStatusFilter("");
  }

  function handleSelect(item: FeedbackItem) {
    setSelectedId(item.id);
    setPicSelection(item.pic !== "Belum ditugaskan" ? item.pic : PIC_OPTIONS[0]);
    setShowOtherFromReporter(false);
    setFlagReasonDraft(item.flagReason ?? "");
    if (!item.read) {
      markFeedbackRead(item.id);
    }
  }

  function handleAssignPic() {
    if (!selected) return;
    setFeedbackPic(selected.id, picSelection, selected.status === "Belum Ditugaskan" ? "Ditinjau" : undefined);
    showToast(`PIC untuk ${selected.id} berhasil ditugaskan ke ${picSelection}`);
  }

  function handleToggleFlag() {
    if (!selected) return;
    const next = !selected.flagged;
    setFeedbackFlag(selected.id, next, next ? flagReasonDraft.trim() || undefined : undefined);
    showToast(next ? `${selected.id} ditandai flag` : `Flag pada ${selected.id} dihapus`);
  }

  function handleFollowUpToggle(value: boolean) {
    if (!selected) return;
    setFeedbackFollowUp(selected.id, value);
    showToast(value ? `${selected.id} dipindahkan ke Perlu Tindak Lanjut` : `${selected.id} tidak lagi memerlukan tindak lanjut`);
  }

  function handleMarkFollowUpDone() {
    if (!selected) return;
    setFollowUpStatus(selected.id, "Selesai");
    showToast(`Tindak lanjut untuk ${selected.id} ditandai selesai`);
  }

  function handleConvertToComplaint() {
    if (!selected) return;
    setFeedbackStatus(selected.id, "Dikonversi");
    showToast(`${selected.id} berhasil dikonversi menjadi pengaduan`);
  }

  function handleCloseFeedback() {
    if (!selected) return;
    setFeedbackStatus(selected.id, "Selesai");
    showToast(`${selected.id} ditandai selesai`);
  }

  const header = MODE_HEADER[mode];

  return (
    <div>
      <PageHeader title={header.title} description={header.description} />

      <div className="mb-4 rounded-lg border border-border bg-card p-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full max-w-xs">
            <Label>Kata kunci</Label>
            <Input placeholder="Topik atau isi pesan..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          </div>
          <div className="w-52">
            <Label>Nama Pelapor</Label>
            <Input placeholder="Cari nama pelapor..." value={reporterQuery} onChange={(e) => setReporterQuery(e.target.value)} />
          </div>
          <div className="w-40">
            <Label>Flag</Label>
            <Select value={flagFilter} onChange={(e) => setFlagFilter(e.target.value)}>
              <option value="">Semua</option>
              <option value="flagged">Ditandai Flag</option>
              <option value="not-flagged">Tidak Ditandai</option>
            </Select>
          </div>
          <div className="w-48">
            <Label>Status</Label>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Semua status</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </div>
          <Button variant="secondary" size="sm" onClick={resetFilters}>
            Reset Filter
          </Button>
        </div>
      </div>

      <Card className="mb-4">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Feedback</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Topik</TableHead>
                <TableHead>Pelapor</TableHead>
                <TableHead>Sumber</TableHead>
                {mode === "follow-up" ? <TableHead>Tindak Lanjut</TableHead> : <TableHead>Status</TableHead>}
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((f) => (
                <TableRow key={f.id} className={f.id === selectedId ? "bg-navy/5" : undefined}>
                  <TableCell className="font-medium text-navy whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5">
                      {!f.read && <span className="size-1.5 rounded-full bg-amber shrink-0" aria-label="Belum dibaca" />}
                      {f.id}
                    </span>
                  </TableCell>
                  <TableCell>
                    <FeedbackTypeBadge type={f.type} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{f.topic}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span className="inline-flex items-center gap-1">
                      {f.flagged && <Flag className="size-3 text-red" />}
                      {f.reporterName}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted whitespace-nowrap">{f.source}</TableCell>
                  {mode === "follow-up" ? (
                    <TableCell>
                      <Badge variant={f.followUpStatus === "Selesai" ? "green" : "amber"}>
                        {f.followUpStatus ?? "Proses"}
                      </Badge>
                    </TableCell>
                  ) : (
                    <TableCell>
                      <Badge variant={statusVariant(f.status)}>{f.status}</Badge>
                    </TableCell>
                  )}
                  <TableCell>
                    <button
                      onClick={() => handleSelect(f)}
                      className="text-navy inline-flex items-center gap-1 hover:underline whitespace-nowrap"
                    >
                      <Eye className="size-3" /> {mode === "follow-up" && f.followUpStatus !== "Selesai" ? "Lihat Detail" : "Baca"}
                    </button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted py-6">
                    Tidak ada kritik/saran yang sesuai dengan filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selected && (
        <Card>
          <CardHeader>
            <CardTitle>Detail Feedback — {selected.id}</CardTitle>
            <CardDescription>
              Diterima pada {selected.createdAt} melalui {selected.source}
            </CardDescription>
          </CardHeader>
          <CardContent className="py-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[11px] uppercase text-muted font-medium mb-1">Tipe</p>
                <FeedbackTypeBadge type={selected.type} />
              </div>
              <div>
                <p className="text-[11px] uppercase text-muted font-medium mb-1">Status</p>
                <Badge variant={statusVariant(selected.status)}>{selected.status}</Badge>
              </div>
              <div>
                <p className="text-[11px] uppercase text-muted font-medium mb-1">Topik</p>
                <p>{selected.topic}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase text-muted font-medium mb-1">PIC Saat Ini</p>
                <p>{selected.pic}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-[11px] uppercase text-muted font-medium mb-1">Pesan Lengkap</p>
                <p className="text-foreground/90">{selected.message}</p>
              </div>
            </div>

            <div className="rounded-md border border-border bg-muted-bg/40 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted mb-2">Data Pelapor</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <Users className="size-3.5 text-muted shrink-0" />
                  <span className="font-medium">{selected.reporterName}</span>
                </div>
                {selected.reporterEmail && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="size-3.5 text-muted shrink-0" />
                    <span>{selected.reporterEmail}</span>
                  </div>
                )}
                {selected.reporterPhone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="size-3.5 text-muted shrink-0" />
                    <span>{selected.reporterPhone}</span>
                  </div>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="mt-2.5"
                onClick={() => setShowOtherFromReporter((v) => !v)}
              >
                {showOtherFromReporter ? "Sembunyikan" : "Lihat Kritik/Saran Lain dari Pelapor Ini"}
                {othersFromReporter.length > 0 && ` (${othersFromReporter.length})`}
              </Button>
              {showOtherFromReporter && (
                <div className="mt-2 divide-y divide-border rounded-md border border-border bg-card">
                  {othersFromReporter.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-muted">Tidak ada kritik/saran lain dari pelapor ini.</p>
                  ) : (
                    othersFromReporter.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => handleSelect(f)}
                        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs hover:bg-muted-bg/60"
                      >
                        <span>
                          <span className="font-medium text-navy">{f.id}</span> — {f.topic}
                        </span>
                        <Badge variant={statusVariant(f.status)}>{f.status}</Badge>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {mode === "follow-up" ? (
              <div className="rounded-md border border-border p-3">
                <p className="text-xs font-semibold text-navy mb-2">Tindak Lanjut</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-muted">Status saat ini:</span>
                  <Badge variant={selected.followUpStatus === "Selesai" ? "green" : "amber"}>
                    {selected.followUpStatus ?? "Proses"}
                  </Badge>
                </div>
                {selected.followUpStatus !== "Selesai" && (
                  <Button size="sm" onClick={handleMarkFollowUpDone}>
                    Tandai Sudah Selesai Tindak Lanjut
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-muted-bg/50 px-3 py-2">
                <span className="text-xs text-muted">Assign PIC ke:</span>
                <Select className="w-56" value={picSelection} onChange={(e) => setPicSelection(e.target.value)}>
                  {PIC_OPTIONS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </Select>
                <Button size="sm" onClick={handleAssignPic}>
                  Konfirmasi
                </Button>
              </div>
            )}

            <div className="rounded-md border border-border p-3">
              <p className="text-xs font-semibold text-navy mb-2">Tandai Flag</p>
              <div className="flex flex-wrap items-start gap-2">
                <Textarea
                  placeholder="Alasan flag (opsional)..."
                  value={flagReasonDraft}
                  onChange={(e) => setFlagReasonDraft(e.target.value)}
                  className="text-xs min-h-[60px] flex-1 min-w-[220px]"
                />
                <Button size="sm" variant={selected.flagged ? "destructive" : "secondary"} onClick={handleToggleFlag}>
                  <Flag className="size-3.5" /> {selected.flagged ? "Hapus Flag" : "Tandai Flag"}
                </Button>
              </div>
            </div>

            <div className="rounded-md border border-border p-3">
              <p className="text-xs font-semibold text-navy mb-2">Butuh Tindak Lanjut?</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={selected.needsFollowUp ? "default" : "outline"}
                  onClick={() => handleFollowUpToggle(true)}
                >
                  Ya, Butuh Tindak Lanjut
                </Button>
                <Button
                  size="sm"
                  variant={!selected.needsFollowUp ? "default" : "outline"}
                  onClick={() => handleFollowUpToggle(false)}
                >
                  Tidak
                </Button>
              </div>
            </div>

            {mode !== "follow-up" && (
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={handleConvertToComplaint}>
                  Konversi Menjadi Pengaduan
                </Button>
                <Button variant="outline" size="sm" onClick={handleCloseFeedback}>
                  Tutup Feedback
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
