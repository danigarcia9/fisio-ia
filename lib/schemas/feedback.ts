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

export const FeedbackRequestSchema = z.object({
  sessionState: SessionStateSchema,
  diagnosticAccuracy: DiagnosticAccuracySchema,
  utility: UtilitySchema,
  difficulty: DifficultySchema,
  notes: z.string().optional(),
});
export type FeedbackRequest = z.infer<typeof FeedbackRequestSchema>;
