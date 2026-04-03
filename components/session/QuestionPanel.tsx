"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Question } from "@/lib/schemas/session";

interface QuestionPanelProps {
  questions: Question[];
  /** Pending (not yet submitted) answers: questionId → option value */
  pendingAnswers: Record<string, string>;
  onSelectAnswer: (questionId: string, answer: string) => void;
  onSubmit: () => void;
  /** Optional notes for the batch submission */
  notes: string;
  onNotesChange: (notes: string) => void;
  isProcessing?: boolean;
}

export function QuestionPanel({
  questions,
  pendingAnswers,
  onSelectAnswer,
  onSubmit,
  notes,
  onNotesChange,
  isProcessing = false,
}: QuestionPanelProps) {
  // Questions already submitted (have answer + answeredAt)
  const submitted = questions.filter((q) => q.answer && q.answeredAt);
  // Questions pending user action (no answer yet, or answer but no answeredAt)
  const pending = questions.filter((q) => !q.answeredAt);

  const pendingCount = Object.keys(pendingAnswers).length;
  const allAnswered = pending.length > 0 && pendingCount === pending.length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold tracking-tight">
          Preguntas discriminatorias
        </h3>
        {pending.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {pending.length} pendientes
          </Badge>
        )}
      </div>

      {pending.length === 0 && submitted.length === 0 && (
        <p className="text-muted-foreground py-4 text-center text-sm">
          Las preguntas aparecerán cuando se generen hipótesis
        </p>
      )}

      {/* Pending questions — user selects answers */}
      {pending.length > 0 && (
        <div className="flex flex-col gap-2">
          {pending.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              selectedAnswer={pendingAnswers[question.id]}
              onSelect={(answer) => onSelectAnswer(question.id, answer)}
              disabled={isProcessing}
            />
          ))}

          {/* Notes field */}
          <Textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Notas adicionales del profesional (opcional)..."
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
              : allAnswered
                ? "Enviar respuestas"
                : pendingCount > 0
                  ? `Enviar ${pendingCount} respuesta${pendingCount > 1 ? "s" : ""}`
                  : "Selecciona respuestas"}
          </Button>
        </div>
      )}

      {/* Submitted questions */}
      {submitted.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-muted-foreground text-xs font-medium">
            Respondidas
          </span>
          {submitted.map((question) => {
            const selectedOption = question.options?.find(
              (o) => o.value === question.answer
            );
            const answerLabel = selectedOption?.label ?? question.answer;

            return (
              <div
                key={question.id}
                className="bg-muted/30 flex items-center justify-between rounded-lg px-3 py-2"
              >
                <span className="text-muted-foreground text-xs">
                  {question.text}
                </span>
                <Badge
                  variant="outline"
                  className="text-xs max-w-50 truncate"
                >
                  {answerLabel}
                </Badge>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function QuestionCard({
  question,
  selectedAnswer,
  onSelect,
  disabled,
}: {
  question: Question;
  selectedAnswer?: string;
  onSelect: (answer: string) => void;
  disabled: boolean;
}) {
  const powerColor =
    question.discriminatoryPower === "high"
      ? "bg-primary/10 text-primary"
      : question.discriminatoryPower === "medium"
        ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
        : "bg-muted text-muted-foreground";

  const hasOptions = question.options && question.options.length > 0;

  return (
    <div className="bg-card border-border rounded-xl border p-3">
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="text-sm leading-relaxed">{question.text}</p>
        <Badge
          className={cn("shrink-0 text-[10px]", powerColor)}
          variant="secondary"
        >
          {question.discriminatoryPower === "high"
            ? "Alta"
            : question.discriminatoryPower === "medium"
              ? "Media"
              : "Baja"}
        </Badge>
      </div>
      <div className="flex flex-col gap-1.5">
        {hasOptions ? (
          question.options.map((option) => (
            <Button
              key={option.id}
              size="sm"
              variant={selectedAnswer === option.value ? "default" : "outline"}
              className="h-auto min-h-10 w-full whitespace-normal px-3 py-2 text-sm text-left justify-start"
              onClick={() => onSelect(option.value)}
              disabled={disabled}
            >
              {option.label}
            </Button>
          ))
        ) : (
          /* Fallback for questions without options (e.g. from partial stream) */
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={selectedAnswer === "yes" ? "default" : "outline"}
              className="h-12 flex-1 text-sm"
              onClick={() => onSelect("yes")}
              disabled={disabled}
            >
              Sí
            </Button>
            <Button
              size="sm"
              variant={selectedAnswer === "no" ? "default" : "outline"}
              className="h-12 flex-1 text-sm"
              onClick={() => onSelect("no")}
              disabled={disabled}
            >
              No
            </Button>
            <Button
              size="sm"
              variant={selectedAnswer === "unclear" ? "default" : "ghost"}
              className="h-12 flex-1 text-sm"
              onClick={() => onSelect("unclear")}
              disabled={disabled}
            >
              No claro
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
