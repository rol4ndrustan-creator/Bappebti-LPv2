import KasusDetailClient from "./client";
import { CASES } from "@/lib/mock-data";

export function generateStaticParams() {
  return CASES.map((c) => ({ ticket: c.ticket }));
}

export default async function KasusDetailPage({
  params,
}: {
  params: Promise<{ ticket: string }>;
}) {
  const { ticket } = await params;
  return <KasusDetailClient ticket={ticket} />;
}
