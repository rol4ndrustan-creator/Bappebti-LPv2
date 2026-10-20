"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ECOSYSTEM_ENTITIES } from "@/lib/mock-data";
import { useEcosystemEntities } from "@/lib/mock-service/ecosystem-store";
import { EcosystemCategory } from "@/lib/types";
import { Building2, LineChart, Landmark, Users2 } from "lucide-react";

const CATEGORIES: { category: EcosystemCategory; description: string; icon: typeof Building2 }[] = [
  {
    category: "Platform/Pialang",
    description: "Pialang berjangka dan platform aset digital yang berizin dan diawasi Bappebti, menjadi pihak pertama yang menangani pengaduan konsumen.",
    icon: Building2,
  },
  {
    category: "Bursa",
    description: "Penyelenggara bursa komoditi/aset digital yang mengawasi platform anggotanya dan menjadi eskalasi penanganan pengaduan.",
    icon: LineChart,
  },
  {
    category: "Kliring",
    description: "Lembaga kliring yang menjamin dan merekonsiliasi penyelesaian transaksi antar anggota bursa.",
    icon: Landmark,
  },
  {
    category: "Asosiasi",
    description: "Asosiasi industri yang mewakili kepentingan kolektif pelaku usaha dan mendukung edukasi publik.",
    icon: Users2,
  },
];

export default function EkosistemKategoriPage() {
  const entities = useEcosystemEntities(ECOSYSTEM_ENTITIES);

  return (
    <div>
      <PageHeader
        title="Kategori Ekosistem"
        description="Kategori pelaku ekosistem yang dapat didaftarkan ke sistem: Platform/Pialang, Bursa, Kliring, dan Asosiasi."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CATEGORIES.map(({ category, description, icon: Icon }) => {
          const count = entities.filter((e) => e.category === category).length;
          return (
            <Card key={category}>
              <CardContent className="py-4 flex gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-navy/10 text-navy">
                  <Icon className="size-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-navy">{category}</h3>
                    <span className="text-[11px] text-muted">({count} terdaftar)</span>
                  </div>
                  <p className="text-xs text-muted mt-0.5">{description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
