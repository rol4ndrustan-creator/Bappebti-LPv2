"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { FeedbackTypeBadge } from "@/components/shared/badges";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useToast } from "@/components/shared/toast-provider";
import { FEEDBACK_LIST } from "@/lib/mock-data";
import { FeedbackItem } from "@/lib/types";
import { Eye } from "lucide-react";
import type { VariantProps } from "class-variance-authority";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

const PIC_OPTIONS = [
  "Belum ditugaskan",
  "Tim Produk Bappebti",
  "Tim Edukasi Bappebti",
  "Tim Pengawasan Bappebti",
  "Tim Operasional Bappebti",
];

function statusVariant(status: FeedbackItem["status"]): BadgeVariant {
  const map: Record<FeedbackItem["status"], BadgeVariant> = {
    "Belum Ditugaskan": "muted",
    Ditinjau: "amber",
    Selesai: "green",
    Dikonversi: "navy",
  };
  return map[status];
}

export default function KritikMasukanPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<FeedbackItem[]>(FEEDBACK_LIST);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [picSelection, setPicSelection] = useState<string>(PIC_OPTIONS[0]);

  const selected = items.find((f) => f.id === selectedId) || null;

  function updateItem(id: string, patch: Partial<FeedbackItem>) {
    setItems((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }

  function handleSelect(item: FeedbackItem) {
    setSelectedId(item.id);
    setPicSelection(item.pic !== "Belum ditugaskan" ? item.pic : PIC_OPTIONS[0]);
  }

  function handleAssignPic() {
    if (!selected) return;
    updateItem(selected.id, { pic: picSelection, status: selected.status === "Belum Ditugaskan" ? "Ditinjau" : selected.status });
    showToast(`PIC untuk ${selected.id} berhasil ditugaskan ke ${picSelection}`);
  }

  function handleMarkReviewed() {
    if (!selected) return;
    updateItem(selected.id, { status: "Ditinjau" });
    showToast(`${selected.id} ditandai sebagai sudah ditinjau`);
  }

  function handleConvertToComplaint() {
    if (!selected) return;
    updateItem(selected.id, { status: "Dikonversi" });
    showToast(`${selected.id} berhasil dikonversi menjadi pengaduan`);
  }

  function handleCloseFeedback() {
    if (!selected) return;
    updateItem(selected.id, { status: "Selesai" });
    showToast(`${selected.id} ditandai selesai`);
  }

  return (
    <div>
      <PageHeader
        title="Kritik / Masukan"
        description="Daftar kritik dan masukan publik terkait layanan pengaduan Bappebti beserta tindak lanjutnya."
      />

      <Card className="mb-4">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Feedback</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Topik</TableHead>
                <TableHead>Pesan</TableHead>
                <TableHead>Sumber</TableHead>
                <TableHead>PIC</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((f) => (
                <TableRow
                  key={f.id}
                  className={f.id === selectedId ? "bg-navy/5" : undefined}
                >
                  <TableCell className="font-medium text-navy whitespace-nowrap">{f.id}</TableCell>
                  <TableCell>
                    <FeedbackTypeBadge type={f.type} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{f.topic}</TableCell>
                  <TableCell className="max-w-[280px] truncate">{f.message}</TableCell>
                  <TableCell className="text-muted whitespace-nowrap">{f.source}</TableCell>
                  <TableCell className="text-muted whitespace-nowrap">{f.pic}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(f.status)}>{f.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleSelect(f)}
                      className="text-navy inline-flex items-center gap-1 hover:underline whitespace-nowrap"
                    >
                      <Eye className="size-3" /> Lihat
                    </button>
                  </TableCell>
                </TableRow>
              ))}
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

            <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-muted-bg/50 px-3 py-2">
              <span className="text-xs text-muted">Assign PIC ke:</span>
              <Select className="w-56" value={picSelection} onChange={(e) => setPicSelection(e.target.value)}>
                {PIC_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
              <Button size="sm" onClick={handleAssignPic}>
                Konfirmasi
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={handleMarkReviewed}>
                Mark Reviewed
              </Button>
              <Button variant="secondary" size="sm" onClick={handleConvertToComplaint}>
                Convert to Complaint
              </Button>
              <Button variant="outline" size="sm" onClick={handleCloseFeedback}>
                Close Feedback
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
