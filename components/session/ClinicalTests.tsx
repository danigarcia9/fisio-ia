"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ClinicalTest } from "@/lib/schemas/session";

interface ClinicalTestsProps {
  tests: ClinicalTest[];
  /** Pending (not yet submitted) results: testId → result */
  pendingResults: Record<
    string,
    "positive" | "negative" | "inconclusive"
  >;
  onSelectResult: (
    testId: string,
    result: "positive" | "negative" | "inconclusive"
  ) => void;
  onSubmit: () => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  isProcessing?: boolean;
}

export function ClinicalTests({
  tests,
  pendingResults,
  onSelectResult,
  onSubmit,
  notes,
  onNotesChange,
  isProcessing = false,
}: ClinicalTestsProps) {
  const completed = tests.filter((t) => t.result && t.executedAt);
  const pending = tests.filter((t) => !t.executedAt);

  const pendingCount = Object.keys(pendingResults).length;
  const allRecorded = pending.length > 0 && pendingCount === pending.length;

  if (tests.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-tight">
          Tests clínicos sugeridos
        </h3>
        {pending.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {pending.length} pendientes
          </Badge>
        )}
      </div>

      {/* Pending tests */}
      {pending.length > 0 && (
        <div className="flex flex-col gap-2">
          {pending.map((test) => (
            <TestCard
              key={test.id}
              test={test}
              selectedResult={pendingResults[test.id]}
              onSelect={(result) => onSelectResult(test.id, result)}
              disabled={isProcessing}
            />
          ))}

          {/* Notes field */}
          <Textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Notas de la exploración (opcional)..."
            rows={2}
            className="mt-1 resize-none text-sm"
            disabled={isProcessing}
          />

          {/* Submit button */}
          <Button
            onClick={onSubmit}
            disabled={pendingCount === 0 || isProcessing}
            className="mt-1 h-11 w-full font-semibold"
          >
            {isProcessing
              ? "Procesando..."
              : allRecorded
                ? "Enviar resultados"
                : pendingCount > 0
                  ? `Enviar ${pendingCount} resultado${pendingCount > 1 ? "s" : ""}`
                  : "Registra resultados"}
          </Button>
        </div>
      )}

      {/* Completed tests */}
      {completed.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-muted-foreground text-xs font-medium">
            Realizados
          </span>
          {completed.map((test) => (
            <div
              key={test.id}
              className="bg-muted/30 flex items-center justify-between rounded-lg px-3 py-2"
            >
              <span className="text-muted-foreground text-xs">{test.name}</span>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  test.result === "positive" &&
                    "border-green-500/30 text-green-600 dark:text-green-400",
                  test.result === "negative" &&
                    "border-red-500/30 text-red-600 dark:text-red-400",
                  test.result === "inconclusive" &&
                    "border-yellow-500/30 text-yellow-600 dark:text-yellow-400"
                )}
              >
                {test.result === "positive"
                  ? "Positivo"
                  : test.result === "negative"
                    ? "Negativo"
                    : "Inconcluso"}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TestCard({
  test,
  selectedResult,
  onSelect,
  disabled,
}: {
  test: ClinicalTest;
  selectedResult?: "positive" | "negative" | "inconclusive";
  onSelect: (result: "positive" | "negative" | "inconclusive") => void;
  disabled: boolean;
}) {
  return (
    <div className="bg-card border-border rounded-xl border p-3">
      <p className="mb-1 text-sm font-medium">{test.name}</p>
      <p className="text-muted-foreground mb-2 text-xs leading-relaxed">
        {test.howToExecute}
      </p>
      <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
        <div className="bg-green-500/5 rounded-lg p-2">
          <span className="font-medium text-green-600 dark:text-green-400">
            + Positivo:
          </span>
          <br />
          <span className="text-muted-foreground">{test.positiveResult}</span>
        </div>
        <div className="bg-red-500/5 rounded-lg p-2">
          <span className="font-medium text-red-600 dark:text-red-400">
            − Negativo:
          </span>
          <br />
          <span className="text-muted-foreground">{test.negativeResult}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={selectedResult === "positive" ? "default" : "outline"}
          className="h-12 flex-1 text-sm"
          onClick={() => onSelect("positive")}
          disabled={disabled}
        >
          Positivo
        </Button>
        <Button
          size="sm"
          variant={selectedResult === "negative" ? "default" : "outline"}
          className="h-12 flex-1 text-sm"
          onClick={() => onSelect("negative")}
          disabled={disabled}
        >
          Negativo
        </Button>
        <Button
          size="sm"
          variant={selectedResult === "inconclusive" ? "default" : "ghost"}
          className="h-12 flex-1 text-sm"
          onClick={() => onSelect("inconclusive")}
          disabled={disabled}
        >
          Inconcluso
        </Button>
      </div>
    </div>
  );
}
