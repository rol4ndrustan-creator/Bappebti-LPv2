"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { SeverityBadge } from "@/components/shared/badges";
import { CaseStatusExplanation } from "@/components/shared/case-status-explanation";
import { CaseProgressTracker } from "@/components/shared/case-progress-tracker";
import { ResponsibilityPanel } from "@/components/shared/responsibility-panel";
import { ClarificationThread } from "@/components/shared/clarification-thread";
import { EvidenceList } from "@/components/shared/evidence-list";
import { ResolutionPanel } from "@/components/shared/resolution-panel";
import { PrototypeNotice } from "@/components/shared/prototype-notice";
import { useToast } from "@/components/shared/toast-provider";
import { getCaseByTicket } from "@/lib/mock-data";
import { formatCurrencyIDR } from "@/lib/format";
import { useCaseData, addClarificationReply, respondToResolution } from "@/lib/mock-service/store";
import { Printer } from "lucide-react";

export default function PengaduanDetailClient({ ticket }: { ticket: string }) {
  const base = getCaseByTicket(ticket);
  const c = useCaseData(base);
  const { showToast } = useToast();
  const [tab, setTab] = useState("ringkasan");

  if (!c) {
    return (
      <div>
        <PageHeader title="Tiket Tidak Ditemukan" />
        <Card>
          <CardContent className="text-sm text-muted py-6 text-center">
            Tiket dengan nomor <span className="font-medium text-foreground">{ticket}</span> tidak
            ditemukan.
            <div className="mt-3">
              <Link href="/publik/pengaduan">
                <Button variant="secondary" size="sm">
                  Kembali ke Daftar Pengaduan
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const publicTimeline = c.timeline.filter((e) => e.visibility !== "internal");

  return (
    <div>
      <PageHeader
        title={`${c.ticket} — ${c.title}`}
        description={`Dilaporkan terhadap ${c.platform} · Diajukan ${c.createdAt} · Diperbarui ${c.updatedAt}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => window.print()}>
              <Printer className="size-3.5" /> Cetak / Unduh Ringkasan
            </Button>
            <Link href="/publik/pengaduan">
              <Button variant="secondary" size="sm">
                Kembali
              </Button>
            </Link>
          </div>
        }
      />

      <PrototypeNotice className="mb-4" />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SeverityBadge severity={c.severity} />
        <span className="text-xs text-muted">Tingkat Prioritas</span>
      </div>

      <div className="mb-4">
        <CaseStatusExplanation complaintCase={c} viewer="public" />
      </div>

      <Card className="mb-4">
        <CardContent className="py-4">
          <CaseProgressTracker complaintCase={c} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="ringkasan">Ringkasan</TabsTrigger>
              <TabsTrigger value="perkembangan">Perkembangan</TabsTrigger>
              <TabsTrigger value="pesan">Pesan dan Klarifikasi</TabsTrigger>
              <TabsTrigger value="bukti">Bukti</TabsTrigger>
              <TabsTrigger value="solusi">Solusi</TabsTrigger>
              <TabsTrigger value="informasi">Informasi Pengaduan</TabsTrigger>
            </TabsList>

            <TabsContent value="ringkasan">
              <Card>
                <CardContent className="py-4">
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <dt className="text-muted">Kategori</dt>
                      <dd className="font-medium">{c.category}</dd>
                    </div>
                    <div>
                      <dt className="text-muted">Subkategori</dt>
                      <dd className="font-medium">{c.subcategory}</dd>
                    </div>
                    <div>
                      <dt className="text-muted">Referensi Transaksi</dt>
                      <dd className="font-medium">{c.transactionRef || "-"}</dd>
                    </div>
                    <div>
                      <dt className="text-muted">Nilai Transaksi</dt>
                      <dd className="font-medium">{formatCurrencyIDR(c.amount)}</dd>
                    </div>
                  </dl>
                  <Separator className="my-3" />
                  <div>
                    <p className="text-xs font-semibold text-navy mb-1">Solusi yang Diharapkan</p>
                    <p className="text-xs text-foreground/80">{c.expectedResolution}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="perkembangan">
              <Card>
                <CardContent className="py-4">
                  {publicTimeline.length === 0 ? (
                    <p className="text-xs text-muted">Belum ada perkembangan yang tercatat.</p>
                  ) : (
                    <ol className="relative border-l border-border ml-3">
                      {publicTimeline.map((e, idx) => (
                        <li key={idx} className="mb-5 ml-5 last:mb-0">
                          <span className="absolute -left-1.5 flex size-3 items-center justify-center rounded-full bg-navy ring-4 ring-card" />
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium">{e.action}</p>
                            <span className="text-[11px] text-muted">{e.datetime}</span>
                          </div>
                          <p className="text-xs text-muted mt-0.5">{e.role}</p>
                          {e.note && <p className="text-xs mt-1 text-foreground/80">{e.note}</p>}
                        </li>
                      ))}
                    </ol>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pesan">
              <Card>
                <CardContent className="py-4">
                  <ClarificationThread
                    messages={c.clarifications}
                    onReply={(message) => {
                      addClarificationReply(ticket, c.reporterName, "Pelapor", message);
                      showToast("Jawaban klarifikasi telah dikirim.");
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bukti">
              <Card>
                <CardContent className="py-4">
                  <EvidenceList files={c.evidences} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="solusi">
              <ResolutionPanel
                complaintCase={c}
                onRespond={(decision, reason) => {
                  respondToResolution(ticket, decision, reason);
                  showToast("Tanggapan Anda atas solusi telah dikirim.");
                }}
              />
            </TabsContent>

            <TabsContent value="informasi">
              <Card>
                <CardContent className="py-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-navy mb-1">Kronologi (Data Asli)</p>
                    <p className="text-xs text-foreground/80">{c.chronology}</p>
                  </div>
                  <Separator />
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <dt className="text-muted">Tanggal Pengaduan Dibuat</dt>
                      <dd className="font-medium">{c.createdAt}</dd>
                    </div>
                    <div>
                      <dt className="text-muted">ID Pengguna Platform</dt>
                      <dd className="font-medium">{c.platformUserId || "-"}</dd>
                    </div>
                  </dl>
                  <p className="text-[11px] text-muted">
                    Kronologi awal bersifat baca-saja. Informasi tambahan atau koreksi dapat disampaikan
                    melalui tab Pesan dan Klarifikasi, dan akan dicatat sebagai amandemen — bukan
                    menimpa data yang telah disampaikan sebelumnya.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex flex-col gap-4">
          <ResponsibilityPanel complaintCase={c} viewer="public" />
        </div>
      </div>
    </div>
  );
}
