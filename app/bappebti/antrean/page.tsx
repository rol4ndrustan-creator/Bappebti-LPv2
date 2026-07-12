"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { SeverityBadge, StatusBadge, OwnerBadge, SlaBadge } from "@/components/shared/badges";
import { CASES } from "@/lib/mock-data";
import { useCasesData } from "@/lib/mock-service/store";
import { ComplaintCase } from "@/lib/types";
import { ArrowRight } from "lucide-react";

function CaseTable({ cases }: { cases: ComplaintCase[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tiket</TableHead>
          <TableHead>Pengaduan</TableHead>
          <TableHead>Platform</TableHead>
          <TableHead>Kategori</TableHead>
          <TableHead>Prioritas</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Penanggung Jawab</TableHead>
          <TableHead>SLA</TableHead>
          <TableHead>Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cases.map((c) => (
          <TableRow key={c.ticket}>
            <TableCell className="font-medium text-navy whitespace-nowrap">{c.ticket}</TableCell>
            <TableCell className="max-w-[240px] truncate">{c.title}</TableCell>
            <TableCell className="text-muted whitespace-nowrap">{c.platform}</TableCell>
            <TableCell className="text-muted whitespace-nowrap">{c.category}</TableCell>
            <TableCell>
              <SeverityBadge severity={c.severity} />
            </TableCell>
            <TableCell>
              <StatusBadge status={c.status} />
            </TableCell>
            <TableCell>
              <OwnerBadge owner={c.currentOwner} />
            </TableCell>
            <TableCell>
              <SlaBadge sla={c.slaStatus} />
            </TableCell>
            <TableCell>
              <Link
                href={`/bappebti/kasus/${c.ticket}`}
                className="text-navy inline-flex items-center gap-1 hover:underline whitespace-nowrap"
              >
                Tinjau <ArrowRight className="size-3" />
              </Link>
            </TableCell>
          </TableRow>
        ))}
        {cases.length === 0 && (
          <TableRow>
            <TableCell colSpan={9} className="text-center text-muted py-6">
              Tidak ada kasus pada kategori ini.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export default function DaftarPengaduanPage() {
  return (
    <Suspense fallback={null}>
      <DaftarPengaduanContent />
    </Suspense>
  );
}

const TAB_HEADER: Record<string, { title: string; description: string }> = {
  semua: {
    title: "Daftar Pengaduan",
    description: "Daftar seluruh kasus pengaduan yang dapat difilter berdasarkan tanggung jawab, prioritas, dan status SLA.",
  },
  bappebti: {
    title: "Penanganan Bappebti",
    description: "Kasus yang sedang ditangani langsung oleh Bappebti sebagai penanggung jawab saat ini.",
  },
};

function DaftarPengaduanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "semua";
  const cases = useCasesData(CASES);

  const all = cases;
  const bappebtiOwned = cases.filter((c) => c.responsibility === "BAPPEBTI OWNED");
  const memberAssigned = cases.filter((c) => c.responsibility === "MEMBER ASSIGNED");
  const waitingPublic = cases.filter((c) => c.responsibility === "WAITING PUBLIC");
  const overdue = cases.filter((c) => c.slaStatus === "Lewat SLA");

  const header = TAB_HEADER[activeTab] ?? TAB_HEADER.semua;

  return (
    <div>
      <PageHeader title={header.title} description={header.description} />

      <Tabs
        value={activeTab}
        onValueChange={(value) => router.push(value === "semua" ? "/bappebti/antrean" : `/bappebti/antrean?tab=${value}`)}
      >
        <TabsList>
          <TabsTrigger value="semua">Semua Kasus ({all.length})</TabsTrigger>
          <TabsTrigger value="bappebti">Dalam Penanganan Bappebti ({bappebtiOwned.length})</TabsTrigger>
          <TabsTrigger value="member">Ditangani Pelaku Usaha ({memberAssigned.length})</TabsTrigger>
          <TabsTrigger value="public">Menunggu Publik ({waitingPublic.length})</TabsTrigger>
          <TabsTrigger value="overdue">Melewati SLA ({overdue.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="semua">
          <CaseTable cases={all} />
        </TabsContent>
        <TabsContent value="bappebti">
          <CaseTable cases={bappebtiOwned} />
        </TabsContent>
        <TabsContent value="member">
          <CaseTable cases={memberAssigned} />
        </TabsContent>
        <TabsContent value="public">
          <CaseTable cases={waitingPublic} />
        </TabsContent>
        <TabsContent value="overdue">
          <CaseTable cases={overdue} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
