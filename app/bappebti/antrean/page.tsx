"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import {
  SeverityBadge,
  StatusBadge,
  OwnerBadge,
  ResponsibilityBadge,
  SlaBadge,
} from "@/components/shared/badges";
import { CASES } from "@/lib/mock-data";
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
          <TableHead>Tingkat</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Current Owner</TableHead>
          <TableHead>Tanggung Jawab</TableHead>
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
              <ResponsibilityBadge responsibility={c.responsibility} />
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
            <TableCell colSpan={10} className="text-center text-muted py-6">
              Tidak ada kasus pada kategori ini.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export default function AntreanOperasionalPage() {
  const all = CASES;
  const bappebtiOwned = CASES.filter((c) => c.responsibility === "BAPPEBTI OWNED");
  const memberAssigned = CASES.filter((c) => c.responsibility === "MEMBER ASSIGNED");
  const waitingPublic = CASES.filter((c) => c.responsibility === "WAITING PUBLIC");
  const critical = CASES.filter((c) => c.severity === "Kritis");
  const overdue = CASES.filter((c) => c.slaStatus === "Lewat SLA");

  return (
    <div>
      <PageHeader
        title="Antrean Operasional"
        description="Daftar seluruh kasus pengaduan yang dapat difilter berdasarkan tanggung jawab, prioritas, dan status SLA."
      />

      <Tabs defaultValue="semua">
        <TabsList>
          <TabsTrigger value="semua">Semua Kasus ({all.length})</TabsTrigger>
          <TabsTrigger value="bappebti">Bappebti-Owned ({bappebtiOwned.length})</TabsTrigger>
          <TabsTrigger value="member">Member-Assigned ({memberAssigned.length})</TabsTrigger>
          <TabsTrigger value="public">Menunggu Publik ({waitingPublic.length})</TabsTrigger>
          <TabsTrigger value="critical">Critical Queue ({critical.length})</TabsTrigger>
          <TabsTrigger value="overdue">Overdue ({overdue.length})</TabsTrigger>
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
        <TabsContent value="critical">
          <CaseTable cases={critical} />
        </TabsContent>
        <TabsContent value="overdue">
          <CaseTable cases={overdue} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
