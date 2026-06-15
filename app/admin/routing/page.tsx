"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { PLATFORM_LIST, ROUTING_MAP } from "@/lib/mock-data";
import { useToast } from "@/components/shared/toast-provider";

const BURSA_OPTIONS = [
  "Bursa Komoditi Nusantara",
  "Bursa Aset Kripto Indonesia",
  "Bursa Berjangka Jakarta",
];

const KLIRING_OPTIONS = [
  "Kliring Berjangka Indonesia",
  "Kliring Aset Digital Nusantara",
];

interface RoutingRow {
  platform: string;
  bursa: string;
  kliring: string;
  configured: boolean;
  lastUpdated: string;
}

function buildInitialRows(): RoutingRow[] {
  return PLATFORM_LIST.filter((p) => p !== "Tidak tahu / belum terdaftar").map((platform) => {
    const mapping = ROUTING_MAP[platform];
    return {
      platform,
      bursa: mapping?.bursa || "",
      kliring: mapping?.kliring || "",
      configured: !!mapping,
      lastUpdated: mapping ? "10 Jun 2026" : "-",
    };
  });
}

export default function RoutingMappingPage() {
  const [rows, setRows] = useState<RoutingRow[]>(buildInitialRows);
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null);
  const [draftBursa, setDraftBursa] = useState("");
  const [draftKliring, setDraftKliring] = useState("");
  const { showToast } = useToast();

  function startEdit(row: RoutingRow) {
    setEditingPlatform(row.platform);
    setDraftBursa(row.bursa || BURSA_OPTIONS[0]);
    setDraftKliring(row.kliring || KLIRING_OPTIONS[0]);
  }

  function saveEdit(platform: string) {
    setRows((prev) =>
      prev.map((r) =>
        r.platform === platform
          ? { ...r, bursa: draftBursa, kliring: draftKliring, configured: true, lastUpdated: "15 Jun 2026" }
          : r
      )
    );
    setEditingPlatform(null);
    showToast("Routing mapping diperbarui");
  }

  return (
    <div>
      <PageHeader
        title="Routing Mapping"
        description="Konfigurasi pemetaan platform/pialang terhadap bursa dan kliring yang mengawasi penyelesaian pengaduan."
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Platform</TableHead>
            <TableHead>Bursa</TableHead>
            <TableHead>Kliring</TableHead>
            <TableHead>Routing Status</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.platform}>
              <TableCell className="font-medium text-navy">{row.platform}</TableCell>
              <TableCell>
                {editingPlatform === row.platform ? (
                  <Select value={draftBursa} onChange={(e) => setDraftBursa(e.target.value)} className="h-8 text-xs w-48">
                    {BURSA_OPTIONS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </Select>
                ) : (
                  row.bursa || "-"
                )}
              </TableCell>
              <TableCell>
                {editingPlatform === row.platform ? (
                  <Select value={draftKliring} onChange={(e) => setDraftKliring(e.target.value)} className="h-8 text-xs w-48">
                    {KLIRING_OPTIONS.map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </Select>
                ) : (
                  row.kliring || "-"
                )}
              </TableCell>
              <TableCell>
                {row.configured ? (
                  <Badge variant="green">TERKONFIGURASI</Badge>
                ) : (
                  <Badge variant="amber">BELUM DIKONFIGURASI</Badge>
                )}
              </TableCell>
              <TableCell className="whitespace-nowrap">{row.lastUpdated}</TableCell>
              <TableCell>
                {editingPlatform === row.platform ? (
                  <div className="flex items-center gap-1.5">
                    <Button size="sm" onClick={() => saveEdit(row.platform)}>Simpan</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingPlatform(null)}>Batal</Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => startEdit(row)}>Edit Mapping</Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
