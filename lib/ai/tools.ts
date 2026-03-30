import { tool } from "ai";
import { z } from "zod/v4";

/**
 * Tool que el agente llama para actualizar el árbol de hipótesis diagnósticas.
 * Genera hipótesis + preguntas discriminatorias. NO genera tests clínicos.
 */
export const updateHypotheses = tool({
  description:
    "Actualiza el árbol de hipótesis diagnósticas basándose en la información disponible. " +
    "Incluye todas las hipótesis activas con probabilidades recalculadas y " +
    "las preguntas discriminatorias más relevantes para el estado actual.",
  inputSchema: z.object({
    hypotheses: z.array(
      z.object({
        id: z.string().describe("ID único de la hipótesis"),
        muscle: z
          .string()
          .describe("Músculo o estructura afectada, ej: 'Deltoides anterior'"),
        condition: z
          .string()
          .describe("Condición/patología, ej: 'Tendinopatía deltoidea'"),
        probability: z
          .number()
          .min(0)
          .max(100)
          .describe("Probabilidad estimada 0-100"),
        justification: z
          .string()
          .describe("Justificación breve de la probabilidad asignada"),
        causalChain: z
          .string()
          .describe(
            "Cadena causal: explica POR QUÉ esta patología en ESTE paciente concreto. " +
            "Conecta perfil ocupacional + actividad deportiva + gesto desencadenante + zona. " +
            "Ejemplo: 'Oficina 8h → flexión mantenida → acortamiento pectoral → " +
            "punto gatillo infraespinoso → dolor referido hombro anterior'"
          ),
      })
    ),
    discriminatoryQuestions: z.array(
      z.object({
        id: z.string().describe("ID único de la pregunta"),
        text: z
          .string()
          .describe(
            "Texto de la pregunta en español, orientada al profesional"
          ),
        discriminatoryPower: z
          .enum(["high", "medium", "low"])
          .describe("Poder discriminatorio de la pregunta"),
        targetHypotheses: z
          .array(z.string())
          .describe("IDs de hipótesis que esta pregunta ayuda a discriminar"),
      })
    ),
    reasoning: z
      .string()
      .describe("Justificación del recálculo del árbol de hipótesis"),
  }),
  execute: async (args) => args,
});

/**
 * Tool para sugerir tests clínicos. Solo disponible en fase de exploración.
 */
export const suggestClinicalTests = tool({
  description:
    "Sugiere tests clínicos específicos para confirmar o descartar hipótesis. " +
    "Solo usar cuando las hipótesis hayan convergido lo suficiente tras las preguntas discriminatorias.",
  inputSchema: z.object({
    clinicalTests: z.array(
      z.object({
        name: z.string().describe("Nombre del test clínico"),
        howToExecute: z
          .string()
          .describe("Instrucciones paso a paso de ejecución"),
        positiveResult: z
          .string()
          .describe("Qué indica un resultado positivo"),
        negativeResult: z
          .string()
          .describe("Qué indica un resultado negativo"),
        targetHypotheses: z
          .array(z.string())
          .describe(
            "IDs de hipótesis que este test ayuda a confirmar/descartar"
          ),
      })
    ),
    reasoning: z
      .string()
      .describe("Justificación de los tests sugeridos"),
  }),
  execute: async (args) => args,
});

/**
 * Tool para registrar red flags — síntomas que requieren derivación o atención especial.
 */
export const flagRedFlag = tool({
  description:
    "Registra una red flag — síntoma que requiere derivación médica o atención especial. " +
    "Usar cuando se detecten síntomas que escapan del ámbito del fisioterapeuta: " +
    "dolor torácico potencialmente cardíaco, síntomas neurológicos graves, " +
    "signos de patología sistémica, etc.",
  inputSchema: z.object({
    symptom: z.string().describe("Descripción del síntoma de alarma"),
    severity: z
      .enum(["urgent", "warning"])
      .describe(
        "'urgent' = derivación inmediata, 'warning' = vigilar y considerar derivación"
      ),
    recommendation: z
      .string()
      .describe(
        "Recomendación concreta para el profesional (a quién derivar, qué hacer)"
      ),
  }),
  execute: async (args) => args,
});

/**
 * Tool para generar la propuesta terapéutica final.
 */
export const proposeTherapy = tool({
  description:
    "Genera la propuesta terapéutica final para la hipótesis diagnóstica seleccionada. " +
    "Las técnicas deben filtrarse por el perfil de clínica del profesional. " +
    "Si una técnica recomendada no está disponible, sugerir alternativa.",
  inputSchema: z.object({
    diagnosis: z.string().describe("Diagnóstico final seleccionado"),
    techniques: z.array(
      z.object({
        name: z.string().describe("Nombre de la técnica"),
        description: z.string().describe("Descripción y cómo aplicarla"),
        available: z
          .boolean()
          .describe("Si está disponible en el contexto de clínica actual"),
        alternative: z
          .string()
          .optional()
          .describe(
            "Alternativa sugerida si no está disponible la técnica principal"
          ),
      })
    ),
    dryNeedling: z
      .object({
        muscle: z.string().describe("Músculo objetivo"),
        technique: z.string().describe("Técnica de punción recomendada"),
        patientPosition: z.string().describe("Posición del paciente"),
        needleSize: z.string().describe("Tamaño de aguja recomendado"),
        depth: z.string().describe("Profundidad de inserción"),
        angle: z.string().describe("Ángulo de inserción"),
        precautions: z
          .array(z.string())
          .describe("Precauciones y contraindicaciones"),
      })
      .optional()
      .describe("Protocolo de punción seca si aplica"),
    exercises: z.array(
      z.object({
        name: z.string().describe("Nombre del ejercicio"),
        description: z.string().describe("Descripción y ejecución"),
        sets: z
          .string()
          .describe("Series y repeticiones, ej: '3x12 repeticiones'"),
        frequency: z.string().describe("Frecuencia, ej: '2 veces al día'"),
      })
    ),
    sessionFrequency: z
      .string()
      .describe("Frecuencia recomendada de sesiones, ej: '2 sesiones/semana'"),
    expectedEvolution: z
      .string()
      .describe(
        "Evolución esperada del paciente con el tratamiento propuesto"
      ),
    followUpSigns: z
      .array(z.string())
      .describe(
        "Señales a vigilar en el seguimiento que indicarían mala evolución"
      ),
  }),
  execute: async (args) => args,
});

// ─── Phase-specific tool sets ───

/** Initial + questioning: only hypotheses, questions, and red flags */
export const questioningTools = {
  updateHypotheses,
  flagRedFlag,
};

/** Examination: adds clinical test suggestions */
export const examinationTools = {
  updateHypotheses,
  suggestClinicalTests,
  flagRedFlag,
};

/** Therapy proposal */
export const therapyTools = {
  proposeTherapy,
  flagRedFlag,
};
