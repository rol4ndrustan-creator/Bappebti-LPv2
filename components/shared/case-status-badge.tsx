import { Badge } from "@/components/ui/badge";
import { ComplaintCase } from "@/lib/types";
import { WORKFLOW_STATES, deriveWorkflowState, getPublicStatus } from "@/lib/workflow-config";

export function CaseStatusBadge({ complaintCase }: { complaintCase: ComplaintCase }) {
  const state = WORKFLOW_STATES[deriveWorkflowState(complaintCase)];
  return <Badge variant={state.badgeTone}>{getPublicStatus(complaintCase).toUpperCase()}</Badge>;
}
