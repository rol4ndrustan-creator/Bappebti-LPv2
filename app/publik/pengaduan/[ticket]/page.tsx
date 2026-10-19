import PengaduanDetailClient from "./client";
import { CASES } from "@/lib/mock-data";

export function generateStaticParams() {
  return CASES.map((c) => ({ ticket: c.ticket }));
}

export default async function PengaduanDetailPage({
  params,
}: {
  params: Promise<{ ticket: string }>;
}) {
  const { ticket } = await params;
  return <PengaduanDetailClient ticket={ticket} />;
}
