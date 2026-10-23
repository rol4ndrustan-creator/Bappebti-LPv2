"use client";

import { useMemo } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { LineTrendChart } from "@/components/shared/trend-chart";
import { CASES, EKOSISTEM_PENGAWAS_MEMBERS } from "@/lib/mock-data";
import { useCasesData } from "@/lib/mock-service/store";
import { useEcosystemPengawasMembers } from "@/lib/mock-service/ecosystem-member-store";
import { deriveWorkflowState, WORKFLOW_STATES } from "@/lib/workflow-config";
import { ComplaintCase } from "@/lib/types";
import { Gavel, FileWarning, PieChart as PieChartIcon, Users } from "lucide-react";

function isClosed(c: ComplaintCase): boolean {
  return !WORKFLOW_STATES[deriveWorkflowState(c)].isOpen;
}

type ViolationCategory = "Kendala Penarikan Dana" | "Masalah Eksekusi Sistem" | "Pelanggaran Etika Promosi" | "Sengketa Perjanjian";

function classifyViolation(c: ComplaintCase): ViolationCategory {
  const text = `${c.category} ${c.subcategory}`.toLowerCase();
  if (text.includes("penipuan") || text.includes("fraud") || text.includes("robot trading")) return "Pelanggaran Etika Promosi";
  if (text.includes("penutupan") || text.includes("sengketa")) return "Sengketa Perjanjian";
  if (text.includes("penarikan") || text.includes("withdrawal") || text.includes("deposit")) return "Kendala Penarikan Dana";
  return "Masalah Eksekusi Sistem";
}

/** "12 Jun 2026" from a createdAt string that may carry a trailing time ("12 Jun 2026, 09:00"). */
function dayLabel(createdAt: string): string {
  return createdAt.split(",")[0]?.trim() ?? createdAt;
}

export default function EkosistemPengawasDashboard() {
  const allCases = useCasesData(CASES);

  const arbitrationCases = allCases.filter((c) => deriveWorkflowState(c) === "ENFORCEMENT_REVIEW");
  const closedCases = allCases.filter(isClosed);
  const resolvedAtMemberLevel = closedCases.filter((c) => c.currentOwner !== "Bappebti").length;
  const rasioPenyelesaian = closedCases.length === 0 ? 0 : Math.round((resolvedAtMemberLevel / closedCases.length) * 100);

  const members = useEcosystemPengawasMembers(EKOSISTEM_PENGAWAS_MEMBERS);
  const activeMembers = members.filter((m) => m.status === "Aktif").length;

  const dailyTrend = useMemo(() => {
    const byDay = new Map<string, number>();
    for (const c of allCases) {
      const label = dayLabel(c.createdAt);
      byDay.set(label, (byDay.get(label) ?? 0) + 1);
    }
    return Array.from(byDay.entries())
      .map(([label, value]) => ({ label, value, sortKey: new Date(label).getTime() }))
      .sort((a, b) => a.sortKey - b.sortKey)
      .slice(-12)
      .map(({ label, value }) => ({ label, value }));
  }, [allCases]);

  const violationBreakdown = useMemo(() => {
    const counts: Record<ViolationCategory, number> = {
      "Kendala Penarikan Dana": 0,
      "Masalah Eksekusi Sistem": 0,
      "Pelanggaran Etika Promosi": 0,
      "Sengketa Perjanjian": 0,
    };
    for (const c of allCases) counts[classifyViolation(c)] += 1;
    return counts;
  }, [allCases]);
  const maxViolation = Math.max(1, ...Object.values(violationBreakdown));

  const watchlist = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of allCases) map.set(c.platform, (map.get(c.platform) ?? 0) + 1);
    return Array.from(map.entries())
      .map(([platform, total]) => ({ platform, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [allCases]);
  const maxWatchlist = Math.max(1, ...watchlist.map((w) => w.total));

  return (
    <div>
      <PageHeader
        title="Dashboard Overview"
        description="Pengawasan kepatuhan kode etik industri, tren sengketa nasabah, dan persiapan mediasi/arbitrase (ASPEBTINDO, BAKTI)."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KpiCard label="Total Pengaduan Industri Terpantau" value={allCases.length} icon={PieChartIcon} tone="navy" />
        <KpiCard label="Kasus Mediasi & Arbitrase Berjalan" value={arbitrationCases.length} icon={Gavel} tone="red" />
        <KpiCard label="Rasio Penyelesaian Industri" value={`${rasioPenyelesaian}%`} icon={FileWarning} tone="green" />
        <KpiCard label="Total Anggota Terdaftar" value={activeMembers} icon={Users} tone="navy" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-navy mb-3">Tren Pengaduan Industri</h2>
          <LineTrendChart data={dailyTrend} />
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-navy mb-3">Distribusi Kategori Dugaan Pelanggaran</h2>
          <div className="space-y-2.5">
            {(Object.entries(violationBreakdown) as [ViolationCategory, number][]).map(([label, value]) => (
              <div key={label}>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-foreground">{label}</span>
                  <span className="text-muted">{value}</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted-bg">
                  <div className="h-full rounded-full bg-navy" style={{ width: `${Math.max((value / maxViolation) * 100, value > 0 ? 3 : 0)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-navy">Watchlist Kepatuhan — Top 5 Pialang Terlapor</h2>
          <p className="text-[11px] text-muted mt-0.5">Untuk keperluan audit kode etik periode berjalan.</p>
        </div>
        <div className="divide-y divide-border">
          {watchlist.map((w, idx) => (
            <div key={w.platform} className="px-4 py-2.5 flex items-center gap-3">
              <span className="flex size-6 items-center justify-center rounded-full bg-red-bg text-red text-[11px] font-semibold shrink-0">
                {idx + 1}
              </span>
              <span className="flex-1 text-xs font-medium text-foreground truncate">{w.platform}</span>
              <div className="w-32 h-2 rounded-full bg-muted-bg overflow-hidden hidden sm:block">
                <div className="h-full bg-red rounded-full" style={{ width: `${(w.total / maxWatchlist) * 100}%` }} />
              </div>
              <span className="text-[11px] text-muted w-20 text-right shrink-0">{w.total} aduan</span>
            </div>
          ))}
          {watchlist.length === 0 && <p className="px-4 py-6 text-center text-xs text-muted">Belum ada data pengaduan.</p>}
        </div>
      </div>
    </div>
  );
}
