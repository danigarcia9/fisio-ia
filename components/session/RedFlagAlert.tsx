"use client";

import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import type { RedFlag } from "@/lib/schemas/session";

interface RedFlagAlertProps {
  redFlags: RedFlag[];
}

export function RedFlagAlert({ redFlags }: RedFlagAlertProps) {
  if (redFlags.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {redFlags.map((flag) => (
        <Alert
          key={flag.id}
          className={cn(
            "border-l-4",
            flag.severity === "urgent"
              ? "border-l-red-500 bg-red-500/10"
              : "border-l-yellow-500 bg-yellow-500/10"
          )}
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-lg">
              {flag.severity === "urgent" ? "🚨" : "⚠️"}
            </span>
            <div className="flex flex-col gap-1">
              <p
                className={cn(
                  "text-sm font-semibold",
                  flag.severity === "urgent"
                    ? "text-red-600 dark:text-red-400"
                    : "text-yellow-600 dark:text-yellow-400"
                )}
              >
                {flag.severity === "urgent"
                  ? "RED FLAG — DERIVACIÓN URGENTE"
                  : "ADVERTENCIA"}
              </p>
              <p className="text-sm">{flag.symptom}</p>
              <p className="text-muted-foreground text-xs">
                {flag.recommendation}
              </p>
            </div>
          </div>
        </Alert>
      ))}
    </div>
  );
}
