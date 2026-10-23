"use client";

import { useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { DonutChart } from "@/components/shared/donut-chart";
import { GroupedBarChart } from "@/components/shared/trend-chart";
import { CASES, CASE_TASKS, PLATFORM_ECOSYSTEM_MEMBERSHIPS } from "@/lib/mock-data";
import { useCasesData } from "@/lib/mock-service/store";
import { useAllTasks } from "@/lib/mock-service/task-store";
import { usePlatformEcosystemMemberships } from "@/lib/mock-service/ecosystem-member-store";
import { useEkosistemActiveRole } from "@/lib/ekosistem-active-role";
import { deriveWorkflowState, WORKFLOW_STATES } from "@/lib/workflow-config";
import { ComplaintCase } from "@/lib/types";
import { ListChecks, SearchCheck, ClipboardList, Percent, Users } from "lucide-react";

function isOpen(c: ComplaintCase): boolean {
  return WORKFLOW_STATES[deriveWorkflowState(c)].isOpen;
}

type TechnicalIssue = "Settlement/Kliring" | "Rekonsiliasi Kustodian" | "Log Order Bursa" | "WD Pending";

function classifyTechnicalIssue(c: ComplaintCase): TechnicalIssue | null {
  const text = `${c.category} ${c.subcategory}`.toLowerCase();
  if (text.includes("settlement") || text.includes("penyelesaian")) return "Settlement/Kliring";
  if (text.includes("saldo") || text.includes("penutupan")) return "Rekonsiliasi Kustodian";
  if (text.includes("penarikan") || text.includes("withdrawal") || text.includes("deposit")) return "WD Pending";
  if (text.includes("transaksi") || text.includes("otorisasi")) return "Log Order Bursa";
  return null;
}

export default function EkosistemActiveDashboard() {
  const { roleType } = useEkosistemActiveRole();
  const allCases = useCasesData(CASES);
  const coordinatedCases = useMemo(() => allCases.filter((c) => c.currentOwner === roleType), [allCases, roleType]);
  const activeCoordinated = useMemo(() => coordinatedCases.filter(isOpen), [coordinatedCases]);
  const menungguVerifikasiTeknis = activeCoordinated.filter((c) => c.status === "Diproses" || c.status === "Verifikasi").length;
  const kepatuhanSla =
    coordinatedCases.length === 0
      ? 100
      : Math.round((coordinatedCases.filter((c) => c.slaStatus !== "Lewat SLA").length / coordinatedCases.length) * 100);

  const allTasks = useAllTasks(CASE_TASKS);
  const coordinatedTickets = useMemo(() => new Set(coordinatedCases.map((c) => c.ticket)), [coordinatedCases]);
  const relatedTasks = useMemo(() => allTasks.filter((t) => coordinatedTickets.has(t.ticket)), [allTasks, coordinatedTickets]);
  const tugasBerjalan = relatedTasks.filter((t) => t.status === "Pending" || t.status === "In Progress");

  const caseByTicket = useMemo(() => new Map(allCases.map((c) => [c.ticket, c])), [allCases]);
  const topUrgentTasks = useMemo(
    () =>
      [...tugasBerjalan]
        .sort((a, b) => {
          const slaA = caseByTicket.get(a.ticket)?.slaDeadline ?? "";
          const slaB = caseByTicket.get(b.ticket)?.slaDeadline ?? "";
          return slaA.localeCompare(slaB);
        })
        .slice(0, 5),
    [tugasBerjalan, caseByTicket]
  );

  // Technical-issue distribution (pie) looks across the full case set (not
  // just currently Bursa/Kliring-owned) so the chart reflects every
  // technical issue ever routed through active-ecosystem coordination,
  // not only the handful of tickets open right now.
  const technicalIssueCounts = useMemo(() => {
    const counts: Record<TechnicalIssue, number> = {
      "Settlement/Kliring": 0,
      "Rekonsiliasi Kustodian": 0,
      "Log Order Bursa": 0,
      "WD Pending": 0,
    };
    for (const c of allCases) {
      const issue = classifyTechnicalIssue(c);
      if (issue) counts[issue] += 1;
    }
    return counts;
  }, [allCases]);

  const dailyLoad = useMemo(() => {
    const byDay = new Map<string, { baru: number; diproses: number; selesai: number }>();
    for (const c of allCases) {
      const day = c.createdAt.split(",")[0]?.trim() ?? c.createdAt;
      const row = byDay.get(day) ?? { baru: 0, diproses: 0, selesai: 0 };
      if (isOpen(c)) {
        if (c.status === "Baru" || c.status === "Verifikasi") row.baru += 1;
        else row.diproses += 1;
      } else {
        row.selesai += 1;
      }
      byDay.set(day, row);
    }
    return Array.from(byDay.entries())
      .slice(-10)
      .map(([label, row]) => ({
        label,
        series: [
          { label: "Baru", value: row.baru, color: "var(--navy)" },
          { label: "Diproses", value: row.diproses, color: "var(--amber)" },
          { label: "Selesai", value: row.selesai, color: "var(--green)" },
        ],
      }));
  }, [allCases]);

  const allMemberships = usePlatformEcosystemMemberships(PLATFORM_ECOSYSTEM_MEMBERSHIPS);
  const members = useMemo(() => allMemberships.filter((m) => m.ecosystemType === roleType), [allMemberships, roleType]);
  const aktifMembers = members.filter((m) => m.status === "Aktif").length;

  return (
    <div>
      <PageHeader
        title="Dashboard Overview"
        description={`Koordinasi operasional teknis penyelesaian kendala transaksi pasar — konteks saat ini: ${roleType}.`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KpiCard label="Kasus Aktif Dikoordinasikan" value={activeCoordinated.length} icon={ListChecks} tone="navy" />
        <KpiCard label="Menunggu Verifikasi Teknis" value={menungguVerifikasiTeknis} icon={SearchCheck} tone="amber" />
        <KpiCard label="Tugas Investigasi Berjalan" value={tugasBerjalan.length} icon={ClipboardList} tone="navy" />
        <KpiCard label="Kepatuhan SLA" value={`${kepatuhanSla}%`} icon={Percent} tone={kepatuhanSla >= 80 ? "green" : "amber"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-navy mb-3">Sebaran Kendala Teknis</h2>
          <DonutChart
            data={[
              { label: "Settlement/Kliring", value: technicalIssueCounts["Settlement/Kliring"], color: "var(--navy)" },
              { label: "Rekonsiliasi Kustodian", value: technicalIssueCounts["Rekonsiliasi Kustodian"], color: "var(--amber)" },
              { label: "Log Order Bursa", value: technicalIssueCounts["Log Order Bursa"], color: "var(--red)" },
              { label: "WD Pending", value: technicalIssueCounts["WD Pending"], color: "var(--green)" },
            ]}
          />
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-navy">Beban Kasus Harian</h2>
            <div className="flex items-center gap-2 text-[10px] text-muted">
              <span className="inline-flex items-center gap-1"><span className="size-2 rounded-full bg-navy inline-block" /> Baru</span>
              <span className="inline-flex items-center gap-1"><span className="size-2 rounded-full bg-amber inline-block" /> Diproses</span>
              <span className="inline-flex items-center gap-1"><span className="size-2 rounded-full bg-green inline-block" /> Selesai</span>
            </div>
          </div>
          <GroupedBarChart data={dailyLoad} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-card">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-navy">Tugas Butuh Tindakan Segera</h2>
          </div>
          <div className="divide-y divide-border">
            {topUrgentTasks.map((t) => (
              <Link
                key={t.id}
                href={`/ekosistem/active/kasus/${t.ticket}`}
                className="flex items-center justify-between gap-3 px-4 py-2.5 text-xs hover:bg-muted-bg transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate">{t.description}</p>
                  <p className="text-muted mt-0.5">{t.ticket} &middot; {t.assignee}</p>
                </div>
                <span className="shrink-0 text-[11px] text-muted">{caseByTicket.get(t.ticket)?.slaDeadline ?? "-"}</span>
              </Link>
            ))}
            {topUrgentTasks.length === 0 && <p className="px-4 py-6 text-center text-xs text-muted">Tidak ada tugas yang butuh tindakan segera.</p>}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-navy mb-3">Direktori Member</h2>
          <div className="flex items-center gap-4">
            <div className="flex size-11 items-center justify-center rounded-lg bg-navy/10 text-navy shrink-0">
              <Users className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-navy">{members.length}</p>
              <p className="text-[11px] text-muted">Total platform/pialang anggota ({roleType})</p>
            </div>
            <div className="ml-auto flex gap-4 text-xs">
              <div className="text-center">
                <p className="font-semibold text-green">{aktifMembers}</p>
                <p className="text-[10px] text-muted">Aktif</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-muted">{members.length - aktifMembers}</p>
                <p className="text-[10px] text-muted">Non-Aktif</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
