"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  type DiagnosticAccuracy,
  type Utility,
  type Difficulty,
  diagnosticAccuracyLabels,
  utilityLabels,
  difficultyLabels,
  diagnosticAccuracyOptions,
  utilityOptions,
  difficultyOptions,
} from "@/lib/schemas/feedback";

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (feedback: {
    diagnosticAccuracy: DiagnosticAccuracy;
    utility: Utility;
    difficulty: Difficulty;
    notes?: string;
  }) => void;
  isSubmitting?: boolean;
}

export function FeedbackModal({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
}: FeedbackModalProps) {
  const [accuracy, setAccuracy] = useState<DiagnosticAccuracy | null>(null);
  const [utility, setUtility] = useState<Utility | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [notes, setNotes] = useState("");

  const canSubmit = accuracy && utility && difficulty;

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit({
      diagnosticAccuracy: accuracy,
      utility,
      difficulty,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Feedback de sesión</DialogTitle>
          <DialogDescription>
            Máximo 30 segundos — tu feedback mejora el sistema
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          {/* Diagnostic accuracy */}
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-semibold">
              Precisión del diagnóstico
            </Label>
            <div className="flex flex-col gap-1.5">
              {diagnosticAccuracyOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setAccuracy(option)}
                  className={cn(
                    "rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                    accuracy === option
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  )}
                >
                  {diagnosticAccuracyLabels[option]}
                </button>
              ))}
            </div>
          </div>

          {/* Utility */}
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-semibold">Utilidad</Label>
            <div className="flex gap-2">
              {utilityOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setUtility(option)}
                  className={cn(
                    "flex-1 rounded-lg px-3 py-2.5 text-center text-sm transition-colors",
                    utility === option
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  )}
                >
                  {utilityLabels[option]}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-semibold">
              Dificultad del caso
            </Label>
            <div className="flex gap-2">
              {difficultyOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setDifficulty(option)}
                  className={cn(
                    "flex-1 rounded-lg px-3 py-2.5 text-center text-sm transition-colors",
                    difficulty === option
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  )}
                >
                  {difficultyLabels[option]}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-semibold">
              Notas <span className="text-muted-foreground font-normal">(opcional)</span>
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observaciones, errores, sugerencias..."
              rows={2}
              className="resize-none text-sm"
            />
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className="h-11 w-full text-sm font-semibold"
          >
            {isSubmitting ? "Guardando..." : "Guardar y cerrar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
