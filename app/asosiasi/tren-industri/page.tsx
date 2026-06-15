import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CATEGORY_TREND = [
  { category: "Dana / Withdrawal", values: [12, 14, 13, 16, 18, 20] },
  { category: "Penutupan Akun", values: [6, 7, 9, 8, 10, 11] },
  { category: "Dugaan Penipuan / Fraud", values: [3, 4, 4, 5, 6, 7] },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"];

const MONTHLY_COMPLAINTS = [32, 38, 41, 47, 52, 58];

const SOURCE_DISTRIBUTION = [
  { source: "Situs Publik", percent: 48 },
  { source: "Email", percent: 24 },
  { source: "Call Center", percent: 18 },
  { source: "Media Sosial", percent: 10 },
];

export default function TrenIndustriPage() {
  const maxCategoryValue = Math.max(...CATEGORY_TREND.flatMap((c) => c.values));
  const maxMonthly = Math.max(...MONTHLY_COMPLAINTS);

  return (
    <div>
      <PageHeader
        title="Tren Industri"
        description="Analisis tren pengaduan industri secara agregat untuk mendukung edukasi dan pengawasan asosiasi terhadap anggota."
      />

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Tren Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {CATEGORY_TREND.map((c) => (
                <div key={c.category}>
                  <div className="text-xs font-medium mb-1.5">{c.category}</div>
                  <div className="flex items-end gap-2 h-20">
                    {c.values.map((v, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[10px] text-muted">{v}</span>
                        <div
                          className="w-full bg-navy/70 rounded-t-sm"
                          style={{ height: `${(v / maxCategoryValue) * 100}%` }}
                        />
                        <span className="text-[10px] text-muted">{MONTHS[i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tren Pengaduan Bulanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 h-40">
              {MONTHLY_COMPLAINTS.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[11px] text-muted">{v}</span>
                  <div
                    className="w-full bg-amber rounded-t-sm"
                    style={{ height: `${(v / maxMonthly) * 100}%` }}
                  />
                  <span className="text-[11px] text-muted">{MONTHS[i]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribusi Sumber Pengaduan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2.5">
              {SOURCE_DISTRIBUTION.map((s) => (
                <div key={s.source} className="flex items-center gap-2">
                  <span className="text-xs w-32 shrink-0">{s.source}</span>
                  <div className="flex-1 h-2.5 rounded-full bg-muted-bg overflow-hidden">
                    <div
                      className="h-full bg-navy rounded-full"
                      style={{ width: `${s.percent}%` }}
                    />
                  </div>
                  <span className="text-xs w-10 text-right text-muted">{s.percent}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
