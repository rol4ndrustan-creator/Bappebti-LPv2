"use client";

import { PageHeader } from "@/components/shared/page-header";
import { FilterableCaseList } from "@/components/shared/filterable-case-list";
import { CASES } from "@/lib/mock-data";
import { useCasesData } from "@/lib/mock-service/store";

export default function PengaduanSelesaiOtomatisPage() {
  const cases = useCasesData(CASES).filter((c) => c.resolution?.decisionMethod === "Otomatis");

  return (
    <div>
      <PageHeader
        title="Ditutup Otomatis"
        description="Pengaduan yang dinyatakan selesai secara otomatis karena pelapor tidak memberikan konfirmasi dalam 2 hari (48 jam) sesuai SLA respons solusi."
      />
      <FilterableCaseList cases={cases} />
    </div>
  );
}
