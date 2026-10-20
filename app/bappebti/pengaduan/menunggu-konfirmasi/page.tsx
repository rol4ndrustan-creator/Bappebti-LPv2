"use client";

import { PageHeader } from "@/components/shared/page-header";
import { FilterableCaseList } from "@/components/shared/filterable-case-list";
import { CASES } from "@/lib/mock-data";
import { useCasesData } from "@/lib/mock-service/store";

export default function MenungguKonfirmasiPelaporPage() {
  const cases = useCasesData(CASES).filter(
    (c) => !!c.resolution && !c.resolution.reporterDecision
  );

  return (
    <div>
      <PageHeader
        title="Menunggu Konfirmasi Pelapor"
        description="Pengaduan yang solusinya telah diajukan oleh pelaku usaha dan sedang menunggu pelapor meninjau serta memberikan tanggapan."
      />
      <FilterableCaseList cases={cases} />
    </div>
  );
}
