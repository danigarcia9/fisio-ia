"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Question } from "@/lib/schemas/session";

interface QuestionPanelProps {
  questions: Question[];
  onAnswer: (questionId: string, answer: "yes" | "no" | "unclear") => void;
  isProcessing?: boolean;
}

export function QuestionPanel({
  questions,
  onAnswer,
  isProcessing = false,
}: QuestionPanelProps) {
  const unanswered = questions.filter((q) => !q.answer);
  const answered = questions.filter((q) => q.answer);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold tracking-tight">
          Preguntas discriminatorias
        </h3>
        {unanswered.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {unanswered.length} pendientes
          </Badge>
        )}
      </div>

      {unanswered.length === 0 && answered.length === 0 && (
        <p className="text-muted-foreground py-4 text-center text-sm">
          Las preguntas aparecerán cuando se generen hipótesis
        </p>
      )}

      {/* Unanswered questions */}
      <div className="flex flex-col gap-2">
        {unanswered.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            onAnswer={(answer) => onAnswer(question.id, answer)}
            disabled={isProcessing}
          />
        ))}
      </div>

      {/* Answered questions */}
      {answered.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-muted-foreground text-xs font-medium">
            Respondidas
          </span>
          {answered.map((question) => (
            <div
              key={question.id}
              className="bg-muted/30 flex items-center justify-between rounded-lg px-3 py-2"
            >
              <span className="text-muted-foreground text-xs">
                {question.text}
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  question.answer === "yes" && "border-green-500/30 text-green-600 dark:text-green-400",
                  question.answer === "no" && "border-red-500/30 text-red-600 dark:text-red-400",
                  question.answer === "unclear" &&
                    "border-yellow-500/30 text-yellow-600 dark:text-yellow-400"
                )}
              >
                {question.answer === "yes"
                  ? "Sí"
                  : question.answer === "no"
                    ? "No"
                    : "No claro"}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function QuestionCard({
  question,
  onAnswer,
  disabled,
}: {
  question: Question;
  onAnswer: (answer: "yes" | "no" | "unclear") => void;
  disabled: boolean;
}) {
  const powerColor =
    question.discriminatoryPower === "high"
      ? "bg-primary/10 text-primary"
      : question.discriminatoryPower === "medium"
        ? "bg-yellow-500/10 text-yellow-400"
        : "bg-muted text-muted-foreground";

  return (
    <div className="bg-card border-border rounded-xl border p-3">
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="text-sm leading-relaxed">{question.text}</p>
        <Badge className={cn("shrink-0 text-[10px]", powerColor)} variant="secondary">
          {question.discriminatoryPower === "high"
            ? "Alta"
            : question.discriminatoryPower === "medium"
              ? "Media"
              : "Baja"}
        </Badge>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          className="h-10 flex-1 text-sm"
          onClick={() => onAnswer("yes")}
          disabled={disabled}
        >
          Sí
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-10 flex-1 text-sm"
          onClick={() => onAnswer("no")}
          disabled={disabled}
        >
          No
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-10 flex-1 text-sm"
          onClick={() => onAnswer("unclear")}
          disabled={disabled}
        >
          No claro
        </Button>
      </div>
    </div>
  );
}
