"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORY_CONFIG } from "@/lib/mock-data";
import { useCategoryConfig, addCategory, setCategoryActive } from "@/lib/mock-service/category-store";
import { useToast } from "@/components/shared/toast-provider";
import { Plus, Ban, CheckCircle2 } from "lucide-react";

export default function KategoriPengaduanPage() {
  const categories = useCategoryConfig(CATEGORY_CONFIG);
  const { showToast } = useToast();
  const [newName, setNewName] = React.useState("");

  function handleAdd() {
    const name = newName.trim();
    if (!name) return;
    addCategory({
      id: `CAT-${Date.now().toString(36).toUpperCase()}`,
      name,
      active: true,
      createdAt: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
    });
    showToast(`Kategori "${name}" berhasil ditambahkan.`);
    setNewName("");
  }

  return (
    <div>
      <PageHeader
        title="Kategori Pengaduan"
        description="Kelola daftar kategori yang tersedia pada formulir pengaduan publik dan filter di seluruh sistem."
      />

      <div className="mb-4 flex flex-wrap items-end gap-2 rounded-lg border border-border bg-card p-3">
        <div className="w-full max-w-xs">
          <Input placeholder="Nama kategori baru..." value={newName} onChange={(e) => setNewName(e.target.value)} />
        </div>
        <Button size="sm" disabled={!newName.trim()} onClick={handleAdd}>
          <Plus className="size-3.5" /> Tambah Kategori
        </Button>
      </div>

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
          {categories.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="whitespace-nowrap text-muted">{c.id}</TableCell>
              <TableCell className="font-medium">{c.name}</TableCell>
              <TableCell>
                <Badge variant={c.active ? "green" : "muted"}>{c.active ? "AKTIF" : "NONAKTIF"}</Badge>
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted">{c.createdAt}</TableCell>
              <TableCell>
                <button
                  title={c.active ? "Nonaktifkan" : "Aktifkan"}
                  onClick={() => setCategoryActive(c.id, !c.active)}
                  className="inline-flex items-center gap-1 rounded p-1 text-muted hover:bg-muted-bg hover:text-navy"
                >
                  {c.active ? <Ban className="size-3.5" /> : <CheckCircle2 className="size-3.5" />}
                  {c.active ? "Nonaktifkan" : "Aktifkan"}
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
