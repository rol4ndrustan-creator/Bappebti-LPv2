import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CASES, MEMBERS } from "@/lib/mock-data";
import { FileWarning, AlertTriangle, GraduationCap, TrendingUp, ListChecks } from "lucide-react";

function getTopCategory() {
  const counts: Record<string, number> = {};
  for (const c of CASES) {
    counts[c.category] = (counts[c.category] || 0) + 1;
  }
  let top = "";
  let max = 0;
  for (const [cat, count] of Object.entries(counts)) {
    if (count > max) {
      max = count;
      top = cat;
    }
  }
  return { top, max };
}

function getCategoryDistribution() {
  const counts: Record<string, number> = {};
  for (const c of CASES) {
    counts[c.category] = (counts[c.category] || 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

const MONTHLY_TREND = [
  { month: "Jan", value: 32 },
  { month: "Feb", value: 38 },
  { month: "Mar", value: 41 },
  { month: "Apr", value: 47 },
  { month: "Mei", value: 52 },
  { month: "Jun", value: 58 },
];

export default function AsosiasiDashboardPage() {
  const totalPengaduan = MEMBERS.reduce((sum, m) => sum + m.totalCases, 0);
  const { top: topCategory } = getTopCategory();
  const slaBreachMembers = MEMBERS.filter((m) => m.slaBreach > 0).length;
  const categoryDistribution = getCategoryDistribution();
  const maxMonthly = Math.max(...MONTHLY_TREND.map((m) => m.value));
  const maxCategory = Math.max(...categoryDistribution.map(([, count]) => count));

  return (
    <div>
      <PageHeader
        title="Dashboard Asosiasi"
        description="Ringkasan agregat kinerja anggota dan tren pengaduan industri. Asosiasi tidak menangani kasus secara langsung — seluruh data ditampilkan dalam bentuk agregat."
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
        <KpiCard
          label="Total Pengaduan Industri"
          value={totalPengaduan}
          icon={ListChecks}
          tone="navy"
          hint="Akumulasi seluruh anggota"
        />
        <KpiCard
          label="Kategori Teratas"
          value={topCategory}
          icon={FileWarning}
          tone="amber"
          hint="Kategori pengaduan terbanyak"
        />
        <KpiCard
          label="Anggota Lewat SLA"
          value={slaBreachMembers}
          icon={AlertTriangle}
          tone="red"
          hint="Memiliki minimal 1 kasus lewat SLA"
        />
        <KpiCard
          label="Topik Edukasi Direkomendasikan"
          value={5}
          icon={GraduationCap}
          tone="green"
          hint="Materi edukasi publik"
        />
        <KpiCard
          label="Tren Pengaduan Bulan Ini"
          value="+12%"
          icon={TrendingUp}
          tone="amber"
          hint="Dibandingkan bulan sebelumnya"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Tren Pengaduan Bulanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 h-40">
              {MONTHLY_TREND.map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[11px] text-muted">{m.value}</span>
                  <div
                    className="w-full bg-navy/80 rounded-t-sm"
                    style={{ height: `${(m.value / maxMonthly) * 100}%` }}
                  />
                  <span className="text-[11px] text-muted">{m.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribusi Kategori Pengaduan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {categoryDistribution.map(([cat, count]) => (
                <div key={cat} className="flex items-center gap-2">
                  <span className="text-xs w-44 shrink-0 truncate">{cat}</span>
                  <div className="flex-1 h-2.5 rounded-full bg-muted-bg overflow-hidden">
                    <div
                      className="h-full bg-amber rounded-full"
                      style={{ width: `${(count / maxCategory) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs w-6 text-right text-muted">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
