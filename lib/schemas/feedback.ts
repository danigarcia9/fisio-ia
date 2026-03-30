import { z } from "zod/v4";
import { SessionStateSchema } from "./session";

export const diagnosticAccuracyOptions = [
  "top1",
  "top3",
  "in_list",
  "not_found",
  "not_diagnosable",
] as const;

export const DiagnosticAccuracySchema = z.enum(diagnosticAccuracyOptions);
export type DiagnosticAccuracy = z.infer<typeof DiagnosticAccuracySchema>;

export const diagnosticAccuracyLabels: Record<DiagnosticAccuracy, string> = {
  top1: "Acertó en su primera sugerencia",
  top3: "El diagnóstico correcto estaba en el top 3",
  in_list: "Estaba en la lista pero no en el top 3",
  not_found: "No incluyó el diagnóstico correcto",
  not_diagnosable: "Caso no diagnosticable con la información disponible",
};

export const utilityOptions = ["helped", "neutral", "confused"] as const;

export const UtilitySchema = z.enum(utilityOptions);
export type Utility = z.infer<typeof UtilitySchema>;

export const utilityLabels: Record<Utility, string> = {
  helped: "Me ayudó / Ahorró tiempo",
  neutral: "Neutral",
  confused: "Me confundió / Perdí tiempo",
};

export const difficultyOptions = ["easy", "medium", "hard"] as const;

export const DifficultySchema = z.enum(difficultyOptions);
export type Difficulty = z.infer<typeof DifficultySchema>;

export const difficultyLabels: Record<Difficulty, string> = {
  easy: "Fácil",
  medium: "Medio",
  hard: "Difícil",
};

export const reasoningFailureOptions = [
  "ignored_postural_pattern",
  "overestimated_sports_factor",
  "missed_proximal_cause",
  "missing_knowledge_base",
  "other",
] as const;

export const ReasoningFailureSchema = z.enum(reasoningFailureOptions);
export type ReasoningFailure = z.infer<typeof ReasoningFailureSchema>;

export const reasoningFailureLabels: Record<ReasoningFailure, string> = {
  ignored_postural_pattern: "Ignoró patrón postural/ocupacional",
  overestimated_sports_factor: "Sobreestimó factor deportivo",
  missed_proximal_cause: "No conectó zona de dolor con causa proximal",
  missing_knowledge_base: "Faltaba conocimiento base (anatomía, referral)",
  other: "Otro (ver notas)",
};

export const FeedbackRequestSchema = z.object({
  sessionState: SessionStateSchema,
  diagnosticAccuracy: DiagnosticAccuracySchema,
  utility: UtilitySchema,
  difficulty: DifficultySchema,
  reasoningFailures: z.array(ReasoningFailureSchema).optional(),
  notes: z.string().optional(),
});
export type FeedbackRequest = z.infer<typeof FeedbackRequestSchema>;
