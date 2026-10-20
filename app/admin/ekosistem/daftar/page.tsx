"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ECOSYSTEM_ENTITIES, BURSA_LIST, KLIRING_LIST } from "@/lib/mock-data";
import { useEcosystemEntities, addEcosystemEntity } from "@/lib/mock-service/ecosystem-store";
import { AddEcosystemDialog } from "@/components/shared/add-ecosystem-dialog";
import { EcosystemCategory, EcosystemEntity } from "@/lib/types";
import { useToast } from "@/components/shared/toast-provider";
import { Plus } from "lucide-react";
import type { VariantProps } from "class-variance-authority";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

const CATEGORIES: EcosystemCategory[] = ["Platform/Pialang", "Bursa", "Kliring", "Asosiasi"];

function statusVariant(status: EcosystemEntity["status"]): BadgeVariant {
  switch (status) {
    case "Disetujui":
      return "green";
    case "Menunggu Persetujuan":
      return "amber";
    case "Ditolak":
      return "red";
  }
}

export default function DaftarEkosistemPage() {
  const entities = useEcosystemEntities(ECOSYSTEM_ENTITIES);
  const { showToast } = useToast();
  const [addOpen, setAddOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [status, setStatus] = React.useState("");

  const filtered = entities.filter((e) => {
    const matchesSearch = !search || e.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !category || e.category === category;
    const matchesStatus = !status || e.status === status;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  function handleAdd(values: { name: string; category: EcosystemCategory; license: string; bursa?: string; kliring?: string }) {
    addEcosystemEntity({
      id: `ECO-${Date.now().toString(36).toUpperCase()}`,
      name: values.name,
      category: values.category,
      license: values.license,
      bursa: values.bursa,
      kliring: values.kliring,
      status: "Menunggu Persetujuan",
      registeredAt: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
    });
    showToast(`${values.name} berhasil didaftarkan dan menunggu persetujuan.`);
  }

  return (
    <div>
      <PageHeader
        title="Daftar Ekosistem"
        description="Seluruh pelaku ekosistem terdaftar: Platform/Pialang, Bursa, Kliring, dan Asosiasi, beserta status pendaftarannya."
        actions={
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="size-3.5" /> Daftarkan Entitas
          </Button>
        }
      />

      <div className="mb-3 flex flex-wrap items-end gap-2">
        <div className="w-full max-w-xs">
          <Label>Cari</Label>
          <Input placeholder="Nama entitas..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="w-48">
          <Label>Kategori</Label>
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Semua kategori</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </div>
        <div className="w-48">
          <Label>Status</Label>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Semua status</option>
            <option value="Disetujui">Disetujui</option>
            <option value="Menunggu Persetujuan">Menunggu Persetujuan</option>
            <option value="Ditolak">Ditolak</option>
          </Select>
        </div>
        <Button variant="secondary" size="sm" onClick={() => { setSearch(""); setCategory(""); setStatus(""); }}>
          Reset Filter
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Entitas</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Nomor Izin</TableHead>
            <TableHead>Bursa</TableHead>
            <TableHead>Kliring</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Terdaftar Sejak</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((e) => (
            <TableRow key={e.id}>
              <TableCell className="font-medium text-navy">{e.name}</TableCell>
              <TableCell>{e.category}</TableCell>
              <TableCell className="whitespace-nowrap">{e.license || "-"}</TableCell>
              <TableCell>{e.bursa || "-"}</TableCell>
              <TableCell>{e.kliring || "-"}</TableCell>
              <TableCell><Badge variant={statusVariant(e.status)}>{e.status.toUpperCase()}</Badge></TableCell>
              <TableCell className="whitespace-nowrap">{e.registeredAt}</TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted py-6">
                Tidak ada entitas yang sesuai dengan filter.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <AddEcosystemDialog open={addOpen} onOpenChange={setAddOpen} bursaOptions={BURSA_LIST} kliringOptions={KLIRING_LIST} onConfirm={handleAdd} />
    </div>
  );
}
