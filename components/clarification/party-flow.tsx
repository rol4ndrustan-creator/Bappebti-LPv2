import { ClarificationParty, ClarificationRequest } from "@/lib/types";
import { CLARIFICATION_PARTY_LABEL, describeClarificationRelation } from "@/lib/clarification-workflow";
import { ArrowRight } from "lucide-react";

function PartyChip({ party, align = "left" }: { party: ClarificationParty; align?: "left" | "right" }) {
  return (
    <span className={`flex flex-col ${align === "right" ? "items-end text-right" : "items-start text-left"}`}>
      <span className="text-xs font-medium text-foreground">
        {party.partyType === "REPORTER" || party.partyType === "BAPPEBTI" ? CLARIFICATION_PARTY_LABEL[party.partyType] : party.institutionName}
      </span>
      <span className="text-[11px] text-muted">{party.userName ?? party.roleLabel}</span>
    </span>
  );
}

/** Visualizes who requested the clarification and who must answer it, plus the plain-language sentence (Section 3). */
export function ClarificationPartyFlow({ clarification }: { clarification: ClarificationRequest }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <PartyChip party={clarification.requestedBy} />
        <ArrowRight className="size-3.5 text-muted shrink-0" />
        <PartyChip party={clarification.requestedFrom} />
      </div>
      <p className="text-xs text-foreground/80">{describeClarificationRelation(clarification)}</p>
    </div>
  );
}
