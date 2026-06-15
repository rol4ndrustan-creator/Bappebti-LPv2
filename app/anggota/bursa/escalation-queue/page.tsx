"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge, SlaBadge } from "@/components/shared/badges";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/shared/toast-provider";
import { CASES, ACTIVE_BURSA } from "@/lib/mock-data";

const escalationCases = CASES.filter(
  (c) => c.currentOwner === "Bursa" && c.bursaEntity === ACTIVE_BURSA
);

export default function EscalationQueuePage() {
  const { showToast } = useToast();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [followUpOpen, setFollowUpOpen] = useState<string | null>(null);
  const [followUpText, setFollowUpText] = useState("");
  const [noteOpen, setNoteOpen] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  const isSettlementRelated = (category: string) => category === "Settlement / Kliring";

  return (
    <div>
      <PageHeader
        title="Escalation Queue"
        description={`Kasus yang dieskalasikan ke ${ACTIVE_BURSA} untuk supervisi langsung terhadap penanganan platform.`}
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tiket</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Pengaduan</TableHead>
                <TableHead>Alasan Eskalasi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>SLA</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {escalationCases.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted py-4">
                    Tidak ada kasus dalam antrean eskalasi.
                  </TableCell>
                </TableRow>
              )}
              {escalationCases.map((c) => {
                const isExpanded = expanded === c.ticket;
                const isFollowUp = followUpOpen === c.ticket;
                const isNote = noteOpen === c.ticket;
                const settlementRelated = isSettlementRelated(c.category);
                return (
                  <>
                    <TableRow key={c.ticket}>
                      <TableCell className="font-medium text-navy">{c.ticket}</TableCell>
                      <TableCell className="max-w-[140px] truncate">{c.platform}</TableCell>
                      <TableCell className="max-w-[180px] truncate">{c.title}</TableCell>
                      <TableCell className="max-w-[220px] text-muted">{c.escalationReason || "-"}</TableCell>
                      <TableCell><StatusBadge status={c.status} /></TableCell>
                      <TableCell><SlaBadge sla={c.slaStatus} /></TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setExpanded(isExpanded ? null : c.ticket)}
                          >
                            {isExpanded ? "Tutup Review" : "Review Penanganan Platform"}
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setFollowUpOpen(isFollowUp ? null : c.ticket)}
                          >
                            Tanya Tindak Lanjut Platform
                          </Button>
                          <div title={settlementRelated ? "" : "Hanya tersedia untuk kasus terkait settlement / kliring"}>
                            <Button
                              variant="secondary"
                              size="sm"
                              disabled={!settlementRelated}
                              onClick={() => showToast(`Kasus ${c.ticket} ditugaskan ke Kliring untuk pengecekan settlement`)}
                            >
                              Tugaskan ke Kliring
                            </Button>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => showToast("Kasus dieskalasi ke Bappebti sebagai BAPPEBTI OWNED")}
                          >
                            Eskalasi ke Bappebti
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setNoteOpen(isNote ? null : c.ticket)}
                          >
                            Tambah Catatan Supervisi
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {isExpanded && (
                      <TableRow key={`${c.ticket}-review`}>
                        <TableCell colSpan={7} className="bg-muted-bg/40">
                          <div className="py-2 space-y-2 max-w-2xl text-xs">
                            <p className="font-medium text-navy">Kronologi Penanganan</p>
                            <p className="text-muted">{c.chronology}</p>
                            <div className="border-l-2 border-navy/20 pl-3 space-y-1.5 mt-2">
                              {c.timeline.map((t, i) => (
                                <div key={i}>
                                  <p className="font-medium text-navy">{t.action} <span className="text-muted font-normal">— {t.datetime}</span></p>
                                  <p className="text-muted">{t.note}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                    {isFollowUp && (
                      <TableRow key={`${c.ticket}-followup`}>
                        <TableCell colSpan={7} className="bg-muted-bg/40">
                          <div className="py-2 space-y-2 max-w-xl">
                            <p className="text-xs font-medium text-navy">Pertanyaan tindak lanjut kepada {c.platform}</p>
                            <Textarea
                              placeholder="Tuliskan pertanyaan tindak lanjut untuk platform..."
                              value={followUpText}
                              onChange={(e) => setFollowUpText(e.target.value)}
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => {
                                  showToast(`Pertanyaan tindak lanjut terkirim ke ${c.platform}`);
                                  setFollowUpText("");
                                  setFollowUpOpen(null);
                                }}
                              >
                                Kirim
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => setFollowUpOpen(null)}>
                                Batal
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                    {isNote && (
                      <TableRow key={`${c.ticket}-note`}>
                        <TableCell colSpan={7} className="bg-muted-bg/40">
                          <div className="py-2 space-y-2 max-w-xl">
                            <p className="text-xs font-medium text-navy">Catatan supervisi untuk {c.ticket}</p>
                            <Textarea
                              placeholder="Tuliskan catatan supervisi internal..."
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => {
                                  showToast("Catatan supervisi disimpan");
                                  setNoteText("");
                                  setNoteOpen(null);
                                }}
                              >
                                Simpan
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => setNoteOpen(null)}>
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
