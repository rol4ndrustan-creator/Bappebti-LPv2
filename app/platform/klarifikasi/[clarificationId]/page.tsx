import { CLARIFICATIONS } from "@/lib/mock-data";
import ClarificationDetailClient from "./client";

export function generateStaticParams() {
  return CLARIFICATIONS.map((c) => ({ clarificationId: c.id }));
}

export default async function ClarificationDetailPage({
  params,
}: {
  params: Promise<{ clarificationId: string }>;
}) {
  const { clarificationId } = await params;
  return <ClarificationDetailClient clarificationId={clarificationId} />;
}
