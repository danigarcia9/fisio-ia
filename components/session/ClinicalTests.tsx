"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ClinicalTest } from "@/lib/schemas/session";

interface ClinicalTestsProps {
  tests: ClinicalTest[];
  onResult: (
    testId: string,
    result: "positive" | "negative" | "inconclusive"
  ) => void;
  isProcessing?: boolean;
}

export function ClinicalTests({
  tests,
  onResult,
  isProcessing = false,
}: ClinicalTestsProps) {
  const pending = tests.filter((t) => !t.result);
  const completed = tests.filter((t) => t.result);

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
      <div className="flex flex-col gap-2">
        {pending.map((test) => (
          <TestCard
            key={test.id}
            test={test}
            onResult={(result) => onResult(test.id, result)}
            disabled={isProcessing}
          />
        ))}
      </div>

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
                  test.result === "positive" && "border-green-500/30 text-green-600 dark:text-green-400",
                  test.result === "negative" && "border-red-500/30 text-red-600 dark:text-red-400",
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
  onResult,
  disabled,
}: {
  test: ClinicalTest;
  onResult: (result: "positive" | "negative" | "inconclusive") => void;
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
          <span className="font-medium text-green-400">+ Positivo:</span>
          <br />
          <span className="text-muted-foreground">{test.positiveResult}</span>
        </div>
        <div className="bg-red-500/5 rounded-lg p-2">
          <span className="font-medium text-red-400">− Negativo:</span>
          <br />
          <span className="text-muted-foreground">{test.negativeResult}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          className="h-10 flex-1 text-sm"
          onClick={() => onResult("positive")}
          disabled={disabled}
        >
          Positivo
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-10 flex-1 text-sm"
          onClick={() => onResult("negative")}
          disabled={disabled}
        >
          Negativo
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-10 flex-1 text-sm"
          onClick={() => onResult("inconclusive")}
          disabled={disabled}
        >
          Inconcluso
        </Button>
      </div>
    </div>
  );
}
