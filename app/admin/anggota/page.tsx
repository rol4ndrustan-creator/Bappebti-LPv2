"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RiskBadge, TrendBadge } from "@/components/shared/badges";
import { MEMBERS } from "@/lib/mock-data";
import { useToast } from "@/components/shared/toast-provider";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function MasterDataAnggotaPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const { showToast } = useToast();

  function toggleExpand(name: string) {
    setExpanded((prev) => (prev === name ? null : name));
  }

  return (
    <div>
      <PageHeader
        title="Master Data Anggota"
        description="Data master anggota terdaftar (Platform/Pialang, Bursa, Kliring) beserta informasi izin dan routing."
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>License Number</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Bursa</TableHead>
            <TableHead>Kliring</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {MEMBERS.map((m) => (
            <>
              <TableRow key={m.name}>
                <TableCell className="font-medium text-navy">{m.name}</TableCell>
                <TableCell>{m.type}</TableCell>
                <TableCell className="whitespace-nowrap">{m.license}</TableCell>
                <TableCell><Badge variant="green">{m.status.toUpperCase()}</Badge></TableCell>
                <TableCell>{m.bursa}</TableCell>
                <TableCell>{m.kliring}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Button size="sm" variant="outline" onClick={() => toggleExpand(m.name)}>
                      {expanded === m.name ? (
                        <>Tutup <ChevronUp className="size-3.5" /></>
                      ) : (
                        <>Lihat Detail <ChevronDown className="size-3.5" /></>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => showToast("Form edit anggota akan dibuka (demo)")}
                    >
                      Edit
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              {expanded === m.name && (
                <TableRow key={`${m.name}-detail`}>
                  <TableCell colSpan={7} className="bg-muted-bg/40">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-2">
                      <div>
                        <div className="text-[11px] uppercase text-muted">Total Kasus</div>
                        <div className="text-sm font-semibold">{m.totalCases}</div>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase text-muted">Ditangani</div>
                        <div className="text-sm font-semibold">{m.handled}</div>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase text-muted">Belum Ditangani</div>
                        <div className="text-sm font-semibold">{m.unhandled}</div>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase text-muted">SLA Breach</div>
                        <div className="text-sm font-semibold">{m.slaBreach}</div>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase text-muted">Kasus Kritis</div>
                        <div className="text-sm font-semibold">{m.critical}</div>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase text-muted">Rata-rata Resolusi</div>
                        <div className="text-sm font-semibold">{m.avgResolution}</div>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase text-muted">SLA Compliance</div>
                        <div className="text-sm font-semibold">{m.slaPercent}%</div>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase text-muted">Risk Level</div>
                        <div className="mt-0.5"><RiskBadge risk={m.risk} /></div>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase text-muted">Kategori Dominan</div>
                        <div className="text-sm font-semibold">{m.category || "-"}</div>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase text-muted">Tren</div>
                        <div className="mt-0.5"><TrendBadge trend={m.trend} /></div>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
