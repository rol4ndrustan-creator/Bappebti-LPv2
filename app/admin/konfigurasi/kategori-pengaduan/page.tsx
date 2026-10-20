"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { DisableConfirmDialog } from "@/components/shared/disable-confirm-dialog";
import { CATEGORY_CONFIG, CONFIG_CHANGE_REQUESTS } from "@/lib/mock-data";
import { useCategoryConfig } from "@/lib/mock-service/category-store";
import { requestConfigChange, useConfigChangeRequests } from "@/lib/mock-service/config-approval-store";
import { useToast } from "@/components/shared/toast-provider";
import { Plus, Ban, CheckCircle2, Clock3 } from "lucide-react";

export default function KategoriPengaduanPage() {
  const categories = useCategoryConfig(CATEGORY_CONFIG);
  const allRequests = useConfigChangeRequests(CONFIG_CHANGE_REQUESTS);
  const { showToast } = useToast();

  const myRequests = allRequests.filter((r) => r.configType === "Kategori Pengaduan");
  const pendingNew = myRequests.filter((r) => r.status === "Menunggu" && r.action === "Tambah");

  function pendingStatusFor(id: string) {
    return myRequests.find((r) => r.status === "Menunggu" && (r.action === "Nonaktifkan" || r.action === "Aktifkan") && JSON.parse(r.payload).id === id);
  }

  const [addOpen, setAddOpen] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [disabling, setDisabling] = React.useState<{ id: string; name: string; active: boolean } | null>(null);

  function handleAdd() {
    const name = newName.trim();
    if (!name) return;
    requestConfigChange({
      configType: "Kategori Pengaduan",
      action: "Tambah",
      itemLabel: "Kategori Pengaduan baru",
      afterValue: name,
      payload: JSON.stringify({ name }),
      requestedBy: "Anda (Petugas Admin)",
    });
    showToast(`Permohonan penambahan kategori "${name}" telah diajukan untuk persetujuan.`);
    setNewName("");
    setAddOpen(false);
  }

  function confirmDisable() {
    if (!disabling) return;
    requestConfigChange({
      configType: "Kategori Pengaduan",
      action: "Nonaktifkan",
      itemLabel: disabling.name,
      beforeValue: "Aktif",
      afterValue: "Nonaktif",
      payload: JSON.stringify({ id: disabling.id }),
      requestedBy: "Anda (Petugas Admin)",
    });
    showToast(`Permohonan nonaktifkan "${disabling.name}" telah diajukan untuk persetujuan.`);
    setDisabling(null);
  }

  return (
    <div>
      <PageHeader
        title="Kategori Pengaduan"
        description="Kelola daftar kategori yang tersedia pada formulir pengaduan publik dan filter di seluruh sistem. Setiap perubahan memerlukan persetujuan pada Approval Configuration."
        actions={
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="size-3.5" /> Tambah Kategori
          </Button>
        }
      />

      {pendingNew.length > 0 && (
        <div className="mb-4 rounded-lg border border-amber/40 bg-amber-bg/40 p-3">
          <p className="text-xs font-semibold text-amber mb-1.5 flex items-center gap-1.5">
            <Clock3 className="size-3.5" /> Menunggu Persetujuan
          </p>
          <ul className="space-y-1 text-xs text-foreground">
            {pendingNew.map((r) => (
              <li key={r.id}>{r.afterValue} — diajukan oleh {r.requestedBy}</li>
            ))}
          </ul>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nama Kategori</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Dibuat</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((c) => {
            const pending = pendingStatusFor(c.id);
            return (
              <TableRow key={c.id}>
                <TableCell className="whitespace-nowrap text-muted">{c.id}</TableCell>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Badge variant={c.active ? "green" : "muted"}>{c.active ? "AKTIF" : "NONAKTIF"}</Badge>
                    {pending && <Badge variant="amber">MENUNGGU PERSETUJUAN</Badge>}
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted">{c.createdAt}</TableCell>
                <TableCell>
                  <button
                    title={c.active ? "Nonaktifkan" : "Aktifkan"}
                    disabled={!!pending}
                    onClick={() => {
                      if (c.active) {
                        setDisabling({ id: c.id, name: c.name, active: true });
                      } else {
                        requestConfigChange({
                          configType: "Kategori Pengaduan",
                          action: "Aktifkan",
                          itemLabel: c.name,
                          beforeValue: "Nonaktif",
                          afterValue: "Aktif",
                          payload: JSON.stringify({ id: c.id }),
                          requestedBy: "Anda (Petugas Admin)",
                        });
                        showToast(`Permohonan aktifkan "${c.name}" telah diajukan untuk persetujuan.`);
                      }
                    }}
                    className="inline-flex items-center gap-1 rounded p-1 text-muted hover:bg-muted-bg hover:text-navy disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {c.active ? <Ban className="size-3.5" /> : <CheckCircle2 className="size-3.5" />}
                    {c.active ? "Nonaktifkan" : "Aktifkan"}
                  </button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Kategori Pengaduan</DialogTitle>
            <DialogDescription>Kategori baru akan aktif setelah disetujui pada Approval Configuration.</DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="new-cat-name">Nama Kategori</Label>
            <Input id="new-cat-name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Contoh: Manipulasi Harga" />
          </div>
          <DialogFooter>
            <Button size="sm" variant="secondary" onClick={() => setAddOpen(false)}>Batal</Button>
            <Button size="sm" disabled={!newName.trim()} onClick={handleAdd}>Ajukan Penambahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {disabling && (
        <DisableConfirmDialog
          open={!!disabling}
          onOpenChange={(v) => !v && setDisabling(null)}
          categoryLabel="Kategori Pengaduan"
          itemName={disabling.name}
          onConfirm={confirmDisable}
        />
      )}
    </div>
  );
}
