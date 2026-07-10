import { ComplaintCase } from "@/lib/types";
import { getActionOwnerLabel } from "@/lib/format";
import { ESCALATION_LEVEL_LABEL } from "@/lib/workflow-config";
import { Badge } from "@/components/ui/badge";

/**
 * Section 2.2 — accountability is not a single field. The public portal only
 * ever sees a simplified view; the regulator portal sees the full structure.
 */
export function ResponsibilityPanel({
  complaintCase,
  viewer = "public",
}: {
  complaintCase: ComplaintCase;
  viewer?: "public" | "internal";
}) {
  const inst = complaintCase.institution;

  if (viewer === "public") {
    return (
      <div className="rounded-lg border border-border bg-card p-3 space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Penanggung Jawab Penanganan</p>
        <dl className="text-xs space-y-1.5">
          <div className="flex justify-between gap-2">
            <dt className="text-muted">Sedang Ditangani Oleh</dt>
            <dd className="font-medium text-right">{getActionOwnerLabel(complaintCase.currentOwner)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted">Dalam Pengawasan</dt>
            <dd className="font-medium text-right">Bappebti</dd>
          </div>
        </dl>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Struktur Tanggung Jawab</p>
      <dl className="text-xs space-y-1.5">
        <Row label="Regulatory Owner" value={inst?.regulatoryOwner ?? "Bappebti"} />
        <Row label="Lead Institution" value={inst?.leadInstitution ?? complaintCase.platform} />
        <Row label="Current Action Owner" value={getActionOwnerLabel(complaintCase.currentOwner)} />
        <Row label="Case Officer" value={inst?.caseOfficer ?? "-"} />
        <Row
          label="Supporting Institutions"
          value={inst?.supportingInstitutions && inst.supportingInstitutions.length > 0 ? inst.supportingInstitutions.join(", ") : "-"}
        />
        <Row label="Decision Authority" value={inst?.decisionAuthority ?? "Bappebti Supervisor"} />
      </dl>
      <div className="flex items-center justify-between pt-1 border-t border-border">
        <span className="text-[11px] text-muted">Escalation Level</span>
        <Badge variant={inst && inst.escalationLevel >= 3 ? "red" : inst && inst.escalationLevel >= 1 ? "amber" : "navy"}>
          {ESCALATION_LEVEL_LABEL[inst?.escalationLevel ?? 0]}
        </Badge>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium text-right">{value}</dd>
    </div>
  );
}
