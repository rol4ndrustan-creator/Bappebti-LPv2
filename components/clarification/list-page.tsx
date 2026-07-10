"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PrototypeNotice } from "@/components/shared/prototype-notice";
import { useDemoSession } from "@/lib/demo-session";
import { ROLE_LABEL } from "@/lib/permissions";
import { CASES } from "@/lib/mock-data";
import { useAllClarifications } from "@/lib/mock-service/clarification-store";
import {
  canViewClarification,
  canCreateClarification,
  getClarificationSummaryCounts,
  getViewerRelation,
  roleToClarificationPartyType,
} from "@/lib/clarification-workflow";
import { ClarificationList } from "./list";
import { ClarificationFilterBar, ClarificationFilterState, EMPTY_CLARIFICATION_FILTERS } from "./filter-bar";
import { ClarificationCreateDialog } from "./create-dialog";
import { AlertCircle, Users, Clock, AlertTriangle, CheckCircle2, Plus } from "lucide-react";

const TABS = [
  { value: "semua", label: "Semua" },
  { value: "perlu-jawaban", label: "Perlu Jawaban Saya" },
  { value: "menunggu-pelapor", label: "Menunggu Pelapor" },
  { value: "menunggu-bappebti", label: "Menunggu Bappebti" },
  { value: "menunggu-bursa-kliring", label: "Menunggu Bursa/Kliring" },
  { value: "selesai", label: "Selesai" },
] as const;

/**
 * Shared Klarifikasi list workspace used by the Platform, Bursa, and Kliring
 * portals. Visibility is scoped per-viewer by canViewClarification, so each
 * portal simply passes its own basePath/caseHrefBase.
 */
export function ClarificationListPage({
  basePath,
  title = "Klarifikasi",
}: {
  basePath: string;
  title?: string;
}) {
  const { user } = useDemoSession();
  const router = useRouter();
  const viewer = React.useMemo(() => ({ role: user.role, institution: user.institution }), [user]);
  const all = useAllClarifications();
  const visible = React.useMemo(() => all.filter((c) => canViewClarification(viewer, c)), [all, viewer]);

  const [tab, setTab] = React.useState<string>("semua");
  const [filters, setFilters] = React.useState<ClarificationFilterState>(EMPTY_CLARIFICATION_FILTERS);
  const [createOpen, setCreateOpen] = React.useState(false);

  const summary = getClarificationSummaryCounts(visible, viewer);

  const tabFiltered = visible.filter((c) => {
    const isOpen = c.status !== "COMPLETED" && c.status !== "CANCELLED";
    switch (tab) {
      case "perlu-jawaban":
        return isOpen && getViewerRelation(c, viewer) === "actor";
      case "menunggu-pelapor":
        return isOpen && c.requestedFrom.partyType === "REPORTER";
      case "menunggu-bappebti":
        return isOpen && c.requestedFrom.partyType === "BAPPEBTI";
      case "menunggu-bursa-kliring":
        return isOpen && (c.requestedFrom.partyType === "BURSA" || c.requestedFrom.partyType === "CLEARING");
      case "selesai":
        return c.status === "COMPLETED";
      default:
        return true;
    }
  });

  const searched = tabFiltered.filter((c) => {
    if (filters.status && c.status !== filters.status) return false;
    if (filters.direction && c.requestDirection !== filters.direction) return false;
    if (filters.priority && c.priority !== filters.priority) return false;
    if (filters.counterparty && c.requestedBy.partyType !== filters.counterparty && c.requestedFrom.partyType !== filters.counterparty) {
      return false;
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const haystack = `${c.id} ${c.caseTicket} ${c.subject} ${c.requestedBy.institutionName} ${c.requestedFrom.institutionName} ${c.requestedFrom.userName ?? ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const scopedCases = React.useMemo(() => {
    const partyType = roleToClarificationPartyType(user.role);
    if (!partyType) return [];
    return CASES.filter(
      (c) => c.platform === user.institution || c.bursaEntity === user.institution || c.kliringEntity === user.institution
    );
  }, [user]);

  const canCreate = canCreateClarification(viewer);

  return (
    <div>
      <PageHeader
        title={title}
        description="Kelola seluruh permintaan informasi tambahan yang berkaitan dengan kasus yang ditangani oleh institusi Anda."
        actions={
          canCreate ? (
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="size-3.5" /> Buat Permintaan Klarifikasi
            </Button>
          ) : undefined
        }
      />
      <PrototypeNotice className="mb-4" />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        <KpiCard label="Perlu Jawaban Institusi Saya" value={summary.needsMyAction} icon={AlertCircle} tone="amber" />
        <KpiCard label="Menunggu Pihak Lain" value={summary.waitingOtherParty} icon={Users} tone="navy" />
        <KpiCard label="Mendekati Batas Waktu" value={summary.dueSoon} icon={Clock} tone="amber" />
        <KpiCard label="Lewat Batas Waktu" value={summary.overdue} icon={AlertTriangle} tone="red" />
        <KpiCard label="Selesai" value={summary.completed} icon={CheckCircle2} tone="green" />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-3 flex-wrap h-auto">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <ClarificationFilterBar filters={filters} onChange={setFilters} />

      <ClarificationList clarifications={searched} viewer={viewer} basePath={basePath} />

      {canCreate && (
        <ClarificationCreateDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          viewer={viewer}
          viewerName={user.name}
          viewerRoleLabel={ROLE_LABEL[user.role]}
          cases={scopedCases}
          onCreated={(id) => router.push(`${basePath}/${id}`)}
        />
      )}
    </div>
  );
}
