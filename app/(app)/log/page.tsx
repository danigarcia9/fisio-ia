"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  diagnosticAccuracyLabels,
  utilityLabels,
  difficultyLabels,
  type DiagnosticAccuracy,
  type Utility,
  type Difficulty,
} from "@/lib/schemas/feedback";

interface FeedbackEntry {
  id: string;
  session_date: string;
  patient_zone: string[] | null;
  patient_profile: string | null;
  patient_age: number | null;
  top_hypothesis: string | null;
  diagnostic_accuracy: DiagnosticAccuracy | null;
  utility: Utility | null;
  difficulty: Difficulty | null;
  notes: string | null;
}

export default function LogPage() {
  const [entries, setEntries] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLog() {
      try {
        const res = await fetch("/api/feedback?action=list");
        if (!res.ok) throw new Error("Failed to fetch log");
        const data = await res.json();
        setEntries(data.entries ?? []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error cargando el log"
        );
      } finally {
        setLoading(false);
      }
    }
    fetchLog();
  }, []);

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Log de desarrollo
        </h1>
        <p className="text-muted-foreground text-sm">
          Historial de sesiones y feedback — solo para Dani y Marco
        </p>
      </div>

      {loading && (
        <p className="text-muted-foreground py-12 text-center">Cargando...</p>
      )}

      {error && (
        <Card className="border-destructive">
          <CardContent className="py-4">
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && entries.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground text-sm">
              No hay entradas en el log todavía. Completa una sesión con
              feedback para ver datos aquí.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {entries.map((entry) => (
          <Card key={entry.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  {new Date(entry.session_date).toLocaleDateString("es-ES", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </CardTitle>
                <div className="flex gap-1.5">
                  {entry.diagnostic_accuracy && (
                    <Badge
                      variant={
                        entry.diagnostic_accuracy === "top1"
                          ? "default"
                          : entry.diagnostic_accuracy === "top3"
                            ? "secondary"
                            : "outline"
                      }
                      className="text-[10px]"
                    >
                      {diagnosticAccuracyLabels[entry.diagnostic_accuracy]}
                    </Badge>
                  )}
                  {entry.difficulty && (
                    <Badge variant="outline" className="text-[10px]">
                      {difficultyLabels[entry.difficulty]}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-1 text-xs">
                {entry.patient_zone && (
                  <p>
                    <span className="text-muted-foreground">Zonas:</span>{" "}
                    {entry.patient_zone.join(", ")}
                  </p>
                )}
                {entry.top_hypothesis && (
                  <p>
                    <span className="text-muted-foreground">
                      Hipótesis principal:
                    </span>{" "}
                    {entry.top_hypothesis}
                  </p>
                )}
                {entry.utility && (
                  <p>
                    <span className="text-muted-foreground">Utilidad:</span>{" "}
                    {utilityLabels[entry.utility]}
                  </p>
                )}
                {entry.notes && (
                  <p className="text-muted-foreground mt-1 italic">
                    &ldquo;{entry.notes}&rdquo;
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
