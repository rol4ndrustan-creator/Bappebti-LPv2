import KasusDetailClient from "./client";

export function generateStaticParams() {
  return [
    { ticket: "BPP-2026-000184" },
    { ticket: "BPP-2026-000185" },
    { ticket: "BPP-2026-000186" },
    { ticket: "BPP-2026-000187" },
    { ticket: "BPP-2026-000188" },
    { ticket: "BPP-2026-000189" },
    { ticket: "BPP-2026-000190" },
    { ticket: "BPP-2026-000191" },
    { ticket: "BPP-2026-000192" },
    { ticket: "BPP-2026-000193" },
    { ticket: "BPP-2026-000194" },
    { ticket: "BPP-2026-000195" },
  ];
}

export default async function KasusDetailPage({
  params,
}: {
  params: Promise<{ ticket: string }>;
}) {
  const { ticket } = await params;
  return <KasusDetailClient ticket={ticket} />;
}
