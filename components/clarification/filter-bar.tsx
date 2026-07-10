import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ClarificationPartyType, ClarificationPriority, ClarificationStatus } from "@/lib/types";
import { CLARIFICATION_PARTY_LABEL, CLARIFICATION_PRIORITY_LABEL, CLARIFICATION_STATUS_LABEL } from "@/lib/clarification-workflow";

export interface ClarificationFilterState {
  search: string;
  status: ClarificationStatus | "";
  direction: "INCOMING" | "OUTGOING" | "";
  priority: ClarificationPriority | "";
  counterparty: ClarificationPartyType | "";
}

export const EMPTY_CLARIFICATION_FILTERS: ClarificationFilterState = {
  search: "",
  status: "",
  direction: "",
  priority: "",
  counterparty: "",
};

/** Section 4 filters: status, direction, requesting/responding party, priority, ticket/subject search. */
export function ClarificationFilterBar({
  filters,
  onChange,
}: {
  filters: ClarificationFilterState;
  onChange: (next: ClarificationFilterState) => void;
}) {
  return (
    <div className="flex flex-wrap items-end gap-2 mb-4">
      <div className="w-full sm:w-64">
        <Label htmlFor="clr-search">Cari</Label>
        <Input
          id="clr-search"
          placeholder="Tiket, ID klarifikasi, subjek, pelapor..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
        />
      </div>
      <div className="w-40">
        <Label htmlFor="clr-status">Status</Label>
        <Select id="clr-status" value={filters.status} onChange={(e) => onChange({ ...filters, status: e.target.value as ClarificationStatus | "" })}>
          <option value="">Semua status</option>
          {Object.entries(CLARIFICATION_STATUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
      </div>
      <div className="w-36">
        <Label htmlFor="clr-direction">Arah</Label>
        <Select id="clr-direction" value={filters.direction} onChange={(e) => onChange({ ...filters, direction: e.target.value as "INCOMING" | "OUTGOING" | "" })}>
          <option value="">Masuk &amp; Keluar</option>
          <option value="INCOMING">Masuk</option>
          <option value="OUTGOING">Keluar</option>
        </Select>
      </div>
      <div className="w-40">
        <Label htmlFor="clr-counterparty">Pihak Terkait</Label>
        <Select id="clr-counterparty" value={filters.counterparty} onChange={(e) => onChange({ ...filters, counterparty: e.target.value as ClarificationPartyType | "" })}>
          <option value="">Semua pihak</option>
          {(Object.keys(CLARIFICATION_PARTY_LABEL) as ClarificationPartyType[]).map((p) => (
            <option key={p} value={p}>
              {CLARIFICATION_PARTY_LABEL[p]}
            </option>
          ))}
        </Select>
      </div>
      <div className="w-36">
        <Label htmlFor="clr-priority">Prioritas</Label>
        <Select id="clr-priority" value={filters.priority} onChange={(e) => onChange({ ...filters, priority: e.target.value as ClarificationPriority | "" })}>
          <option value="">Semua</option>
          {Object.entries(CLARIFICATION_PRIORITY_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
      </div>
      <Button variant="secondary" size="sm" onClick={() => onChange(EMPTY_CLARIFICATION_FILTERS)}>
        Reset
      </Button>
    </div>
  );
}
