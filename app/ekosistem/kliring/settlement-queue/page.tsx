"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge, SlaBadge } from "@/components/shared/badges";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/shared/toast-provider";
import { CASES, formatCurrency } from "@/lib/mock-data";
import { ComplaintCase } from "@/lib/types";

const initialCases = CASES.filter((c) => c.category === "Settlement / Kliring");

export default function SettlementQueuePage() {
  const { showToast } = useToast();
  const [cases] = useState<ComplaintCase[]>(initialCases);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [requestOpen, setRequestOpen] = useState<string | null>(null);
  const [requestText, setRequestText] = useState("");
  const [returned, setReturned] = useState<Record<string, boolean>>({});

  function toggleExpand(ticket: string) {
    setExpanded((prev) => (prev === ticket ? null : ticket));
    setRequestOpen(null);
    setRequestText("");
  }

  return (
    <div>
      <PageHeader
        title="Settlement Queue"
        description="Daftar kasus settlement / kliring yang menjadi tanggung jawab Kliring Berjangka Indonesia untuk diproses dan direkonsiliasi."
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tiket</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Transaction Ref</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>SLA</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted py-4">
                    Tidak ada kasus settlement dalam antrean.
                  </TableCell>
                </TableRow>
              )}
              {cases.map((c) => {
                const isExpanded = expanded === c.ticket;
                const isRequest = requestOpen === c.ticket;
                const isReturned = !!returned[c.ticket];
                return (
                  <>
                    <TableRow key={c.ticket}>
                      <TableCell className="font-medium text-navy">{c.ticket}</TableCell>
                      <TableCell className="max-w-[160px] truncate text-muted">{c.platform}</TableCell>
                      <TableCell className="text-muted">{c.category}</TableCell>
                      <TableCell className="text-muted">{c.transactionRef}</TableCell>
                      <TableCell>{formatCurrency(c.amount)}</TableCell>
                      <TableCell>
                        {isReturned ? (
                          <span className="text-[11px] text-muted">Dikembalikan ke Platform</span>
                        ) : (
                          <StatusBadge status={c.status} />
                        )}
                      </TableCell>
                      <TableCell><SlaBadge sla={c.slaStatus} /></TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          <Button variant="outline" size="sm" onClick={() => toggleExpand(c.ticket)}>
                            {isExpanded ? "Tutup Detail" : "Detail"}
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => showToast("Referensi settlement dikonfirmasi")}
                          >
                            Konfirmasi Referensi
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setRequestOpen(requestOpen === c.ticket ? null : c.ticket);
                              setExpanded(null);
                            }}
                          >
                            Minta Data Platform
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => showToast(`Hasil settlement untuk ${c.ticket} berhasil diunggah (demo)`)}
                          >
                            Unggah Hasil Settlement
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              showToast(`Kasus ${c.ticket} dikembalikan ke Platform`);
                              setReturned((prev) => ({ ...prev, [c.ticket]: true }));
                            }}
                          >
                            Kembalikan ke Platform
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => showToast(`Kasus ${c.ticket} dieskalasi ke Bappebti`)}
                          >
                            Eskalasi ke Bappebti
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {isExpanded && (
                      <TableRow key={`${c.ticket}-detail`}>
                        <TableCell colSpan={8} className="bg-muted-bg/40">
                          <div className="py-2 space-y-2 max-w-2xl text-xs">
                            <p className="font-medium text-navy">{c.title}</p>
                            <p className="text-muted">{c.chronology}</p>
                            {c.reconciliationIssue && (
                              <p>
                                <span className="text-muted">Isu rekonsiliasi: </span>
                                {c.reconciliationIssue}
                              </p>
                            )}
                            <p>
                              <span className="text-muted">Resolusi yang diharapkan: </span>
                              {c.expectedResolution}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                    {isRequest && (
                      <TableRow key={`${c.ticket}-request`}>
                        <TableCell colSpan={8} className="bg-muted-bg/40">
                          <div className="py-2 space-y-2 max-w-xl">
                            <p className="text-xs font-medium text-navy">
                              Permintaan data ke {c.platform}
                            </p>
                            <Textarea
                              placeholder="Tuliskan data yang dibutuhkan dari platform untuk proses rekonsiliasi..."
                              value={requestText}
                              onChange={(e) => setRequestText(e.target.value)}
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => {
                                  if (!requestText.trim()) {
                                    showToast("Permintaan data tidak boleh kosong.");
                                    return;
                                  }
                                  showToast(`Permintaan data terkirim ke ${c.platform}`);
                                  setRequestText("");
                                  setRequestOpen(null);
                                }}
                              >
                                Kirim Permintaan
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => setRequestOpen(null)}>
                                Batal
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
