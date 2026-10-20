"use client";

import { PageHeader } from "@/components/shared/page-header";
import { FilterableCaseList } from "@/components/shared/filterable-case-list";
import { CASES } from "@/lib/mock-data";
import { useCasesData } from "@/lib/mock-service/store";

export default function PenangananBappebtiPage() {
  const cases = useCasesData(CASES).filter((c) => c.responsibility === "BAPPEBTI OWNED");

  return (
    <div>
      <PageHeader
        title="Penanganan Bappebti"
        description="Kasus yang sedang ditangani langsung oleh Bappebti sebagai penanggung jawab saat ini."
      />
      <FilterableCaseList cases={cases} />
    </div>
  );
}
