"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge, OwnerBadge } from "@/components/shared/badges";
import { CASES, CATEGORY_LIST } from "@/lib/mock-data";
import { CaseStatus } from "@/lib/types";

const STATUS_LIST: CaseStatus[] = [
  "Baru",
  "Verifikasi",
  "Diproses",
  "Menunggu Klarifikasi",
  "Resolusi Diajukan",
  "Selesai",
  "Ditolak",
];

export default function PengaduanListPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");

  const filtered = useMemo(() => {
    return CASES.filter((c) => {
      const matchesSearch =
        !search ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.ticket.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !status || c.status === status;
      const matchesCategory = !category || c.category === category;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [search, status, category]);

  function resetFilters() {
    setSearch("");
    setStatus("");
    setCategory("");
  }

  return (
    <div>
      <PageHeader
        title="Pengaduan Saya"
        description="Daftar seluruh pengaduan yang telah Anda ajukan beserta status penanganannya."
      />

      <div className="mb-3 flex flex-wrap items-end gap-2">
        <div className="w-full max-w-xs">
          <Input
            placeholder="Cari judul atau nomor tiket..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-44">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Semua status</option>
            {STATUS_LIST.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-56">
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Semua kategori</option>
            {CATEGORY_LIST.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <Button variant="secondary" size="sm" onClick={resetFilters}>
          Reset
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tiket</TableHead>
            <TableHead>Judul</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Current Owner</TableHead>
            <TableHead>Update Terakhir</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((c) => (
            <TableRow key={c.ticket}>
              <TableCell className="font-medium text-navy whitespace-nowrap">{c.ticket}</TableCell>
              <TableCell className="max-w-xs">{c.title}</TableCell>
              <TableCell className="whitespace-nowrap">{c.platform}</TableCell>
              <TableCell className="whitespace-nowrap">{c.category}</TableCell>
              <TableCell>
                <StatusBadge status={c.status} />
              </TableCell>
              <TableCell>
                <OwnerBadge owner={c.currentOwner} />
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted">{c.updatedAt}</TableCell>
              <TableCell>
                <Link href={`/publik/pengaduan/${c.ticket}`}>
                  <Button size="sm" variant="secondary">
                    Lihat Detail
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted py-6">
                Tidak ada pengaduan yang sesuai dengan filter.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
