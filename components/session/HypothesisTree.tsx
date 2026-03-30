"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { Hypothesis } from "@/lib/schemas/session";

interface HypothesisTreeProps {
  hypotheses: Hypothesis[];
  onConfirm: (hypothesisId: string) => void;
  onDiscard: (hypothesisId: string, reason: string) => void;
  onReopen: (hypothesisId: string) => void;
  onSelectForTherapy: (hypothesisId: string) => void;
  isProcessing?: boolean;
}

export function HypothesisTree({
  hypotheses,
  onConfirm,
  onDiscard,
  onReopen,
  onSelectForTherapy,
  isProcessing = false,
}: HypothesisTreeProps) {
  const activeHypotheses = hypotheses
    .filter((h) => h.isActive)
    .sort((a, b) => b.probability - a.probability);

  const discardedHypotheses = hypotheses.filter((h) => !h.isActive);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold tracking-tight">
          Hipótesis diagnósticas
        </h3>
        {isProcessing && (
          <Badge variant="secondary" className="animate-pulse text-xs">
            Recalculando...
          </Badge>
        )}
      </div>

      {activeHypotheses.length === 0 && !isProcessing && (
        <p className="text-muted-foreground py-8 text-center text-sm">
          Selecciona zonas de dolor y un perfil para generar hipótesis
        </p>
      )}

      {/* Active hypotheses */}
      <div className="flex flex-col gap-2">
        {activeHypotheses.map((hypothesis, index) => (
          <HypothesisCard
            key={hypothesis.id}
            hypothesis={hypothesis}
            rank={index + 1}
            onConfirm={() => onConfirm(hypothesis.id)}
            onDiscard={(reason) => onDiscard(hypothesis.id, reason)}
            onSelectForTherapy={() => onSelectForTherapy(hypothesis.id)}
          />
        ))}
      </div>

      {/* Discarded hypotheses */}
      {discardedHypotheses.length > 0 && (
        <Collapsible>
          <CollapsibleTrigger className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors">
            <svg
              className="h-3 w-3"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M 3 5 L 6 8 L 9 5" />
            </svg>
            {discardedHypotheses.length} descartadas
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 flex flex-col gap-1.5">
            {discardedHypotheses.map((hypothesis) => (
              <div
                key={hypothesis.id}
                className="bg-muted/50 flex items-center justify-between rounded-lg px-3 py-2 opacity-60"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-medium line-through">
                    {hypothesis.muscle} — {hypothesis.condition}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {hypothesis.discardedReason ?? "Descartada"}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => onReopen(hypothesis.id)}
                >
                  Reconsiderar
                </Button>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}

function HypothesisCard({
  hypothesis,
  rank,
  onConfirm,
  onDiscard,
  onSelectForTherapy,
}: {
  hypothesis: Hypothesis;
  rank: number;
  onConfirm: () => void;
  onDiscard: (reason: string) => void;
  onSelectForTherapy: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [discardReason, setDiscardReason] = useState("");
  const [showDiscardInput, setShowDiscardInput] = useState(false);

  const probabilityColor =
    hypothesis.probability >= 60
      ? "text-green-600 dark:text-green-400"
      : hypothesis.probability >= 30
        ? "text-yellow-600 dark:text-yellow-400"
        : "text-muted-foreground";

  return (
    <div
      className={cn(
        "bg-card border-border rounded-xl border p-3 transition-all",
        rank === 1 && "border-primary/30 ring-primary/10 ring-1"
      )}
    >
      {/* Header */}
      <button
        type="button"
        className="flex w-full items-start justify-between gap-2 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="bg-muted flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
              {rank}
            </span>
            <span className="truncate text-sm font-semibold">
              {hypothesis.muscle}
            </span>
          </div>
          <span className="text-muted-foreground ml-7 text-xs">
            {hypothesis.condition}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className={cn("text-sm font-bold tabular-nums", probabilityColor)}>
            {hypothesis.probability}%
          </span>
        </div>
      </button>

      {/* Probability bar */}
      <div className="mt-2">
        <Progress value={hypothesis.probability} className="h-1.5" />
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="mt-3 flex flex-col gap-3">
          {hypothesis.causalChain && (
            <div className="bg-muted/40 rounded-lg px-3 py-2">
              <p className="text-muted-foreground mb-0.5 text-[10px] font-medium uppercase tracking-wider">
                Cadena causal
              </p>
              <p className="text-foreground text-xs leading-relaxed">
                {hypothesis.causalChain}
              </p>
            </div>
          )}

          <p className="text-muted-foreground text-xs leading-relaxed">
            {hypothesis.justification}
          </p>

          {hypothesis.confirmedByTest && (
            <Badge variant="outline" className="w-fit text-xs text-green-600 dark:text-green-400">
              Confirmado: {hypothesis.confirmedByTest}
            </Badge>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              className="h-10 text-sm"
              onClick={onSelectForTherapy}
            >
              Proponer tratamiento
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-10 text-sm"
              onClick={onConfirm}
            >
              Confirmar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-10 text-sm text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
              onClick={() => setShowDiscardInput(!showDiscardInput)}
            >
              Descartar
            </Button>
          </div>

          {showDiscardInput && (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Razón (opcional)"
                value={discardReason}
                onChange={(e) => setDiscardReason(e.target.value)}
                className="bg-muted flex-1 rounded-lg px-3 py-1.5 text-xs"
              />
              <Button
                size="sm"
                variant="destructive"
                className="h-8 text-xs"
                onClick={() => {
                  onDiscard(discardReason || "Descartada por el profesional");
                  setShowDiscardInput(false);
                  setDiscardReason("");
                }}
              >
                Confirmar
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
