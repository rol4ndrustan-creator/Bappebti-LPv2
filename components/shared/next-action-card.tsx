"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CaseActionDialog, TONE_TO_BUTTON_VARIANT } from "@/components/shared/case-action-dialog";
import { CASE_ACTIONS, CaseActionId, getContextualActions } from "@/lib/case-actions";
import { ComplaintCase } from "@/lib/types";
import { ChevronDown, Sparkles } from "lucide-react";

/**
 * "Tindakan Berikutnya" — the single most important decision on the case
 * page: what should Bappebti do next, who ends up responsible, and by when.
 * Sits between the status summary and the detail tabs so it's visible
 * without scrolling.
 */
export function NextActionCard({
  complaintCase,
  onExecute,
}: {
  complaintCase: ComplaintCase;
  onExecute: (actionId: CaseActionId, values: Record<string, string>) => void;
}) {
  const { primary, secondary, overflow } = getContextualActions(complaintCase);
  const [activeAction, setActiveAction] = React.useState<CaseActionId | null>(null);
  const [showMore, setShowMore] = React.useState(false);

  if (!primary && secondary.length === 0 && overflow.length === 0) {
    return (
      <Card>
        <CardContent className="py-4 text-sm text-muted">
          Pengaduan ini telah ditutup. Tidak ada tindakan lanjutan yang tersedia.
        </CardContent>
      </Card>
    );
  }

  const primaryDef = primary ? CASE_ACTIONS[primary] : null;
  const primaryImpact = primaryDef?.impact(complaintCase);

  return (
    <>
      <Card>
        <CardContent className="py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-navy mb-3">Tindakan Berikutnya</p>

          {primaryDef && primaryImpact && (
            <div className="rounded-md border border-navy/15 bg-navy/[0.03] p-3 mb-3">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-navy mb-1.5">
                <Sparkles className="size-3.5" /> Rekomendasi Sistem
              </div>
              <p className="text-sm font-semibold text-foreground mb-1">{primaryDef.label}</p>
              <p className="text-xs text-muted leading-relaxed mb-3">{primaryDef.body(complaintCase)}</p>

              <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                <div>
                  <p className="text-muted">Status setelah tindakan</p>
                  <p className="font-medium text-foreground mt-0.5">{primaryImpact.status}</p>
                </div>
                <div>
                  <p className="text-muted">Penanggung jawab berikutnya</p>
                  <p className="font-medium text-foreground mt-0.5">{primaryImpact.owner}</p>
                </div>
                <div>
                  <p className="text-muted">Batas waktu</p>
                  <p className="font-medium text-foreground mt-0.5">{primaryImpact.sla}</p>
                </div>
              </div>

              <Button size="sm" onClick={() => setActiveAction(primaryDef.id)}>
                {primaryDef.label}
              </Button>
            </div>
          )}

          {(secondary.length > 0 || overflow.length > 0) && (
            <div className="flex flex-wrap items-center gap-2">
              {secondary.map((id) => {
                const def = CASE_ACTIONS[id];
                return (
                  <Button
                    key={id}
                    size="sm"
                    variant={TONE_TO_BUTTON_VARIANT[def.tone]}
                    onClick={() => setActiveAction(id)}
                  >
                    {def.label}
                  </Button>
                );
              })}
              {overflow.length > 0 && (
                <div className="relative">
                  <Button size="sm" variant="ghost" onClick={() => setShowMore((v) => !v)}>
                    Tindakan Lainnya <ChevronDown className="size-3.5" />
                  </Button>
                  {showMore && (
                    <div className="absolute left-0 top-full mt-1 z-10 w-56 rounded-md border border-border bg-white shadow-lg p-1">
                      {overflow.map((id) => {
                        const def = CASE_ACTIONS[id];
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => {
                              setActiveAction(id);
                              setShowMore(false);
                            }}
                            className={`w-full text-left rounded-sm px-2.5 py-1.5 text-xs hover:bg-muted-bg ${
                              def.tone === "destructive" ? "text-red" : "text-foreground"
                            }`}
                          >
                            {def.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {activeAction && (
        <CaseActionDialog
          action={CASE_ACTIONS[activeAction]}
          complaintCase={complaintCase}
          open={!!activeAction}
          onOpenChange={(v) => !v && setActiveAction(null)}
          onConfirm={(values) => onExecute(activeAction, values)}
        />
      )}
    </>
  );
}
