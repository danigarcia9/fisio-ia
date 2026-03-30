import { streamText, Output } from "ai";
import {
  anthropic,
  type AnthropicLanguageModelOptions,
} from "@ai-sdk/anthropic";
import { buildSystemPrompt } from "./prompts";
import type { PromptPhase } from "./prompts";
import {
  InitialOutputSchema,
  QuestioningOutputSchema,
  ExaminationOutputSchema,
  ProposalOutputSchema,
} from "./schemas";
import type {
  SessionState,
  SessionPhase,
  SportProfile,
  FunctionalMovementAssessment,
} from "@/lib/schemas/session";
import type { ClinicContext } from "@/lib/schemas/profile";

const MODEL = anthropic("claude-sonnet-4-6");

const ANTHROPIC_THINKING_OPTIONS = {
  anthropic: {
    thinking: { type: "adaptive" },
    effort: "low",
  } satisfies AnthropicLanguageModelOptions,
};

interface AgentContext {
  professionalName: string;
  clinicContext: ClinicContext;
}

// ─── Label maps for narrative builder ───

const occupationalLabels: Record<string, string> = {
  sedentary: "trabajo sedentario (>6h sentado/a)",
  prolonged_standing: "trabajo de pie prolongado",
  moderate_physical: "carga física moderada en el trabajo",
  heavy_physical:
    "carga física pesada en el trabajo (construcción, agricultura...)",
};

const activityLabels: Record<string, string> = {
  none: "sin actividad deportiva estructurada",
  recreational: "actividad recreativa (<2 sesiones/semana)",
  regular: "entrenamiento regular (2-4 sesiones/semana)",
  high_performance:
    "alto rendimiento (>5 sesiones/semana o competición)",
};

/** Map session phase to prompt phase */
function toPromptPhase(sessionPhase: SessionPhase): PromptPhase {
  switch (sessionPhase) {
    case "initial":
      return "INITIAL";
    case "questioning":
      return "QUESTIONING";
    case "examination":
      return "EXAMINATION";
    case "therapy_proposal":
      return "PROPOSAL";
    case "closed":
      return "PROPOSAL";
  }
}

/** Select output schema based on prompt phase */
function outputForPhase(phase: PromptPhase) {
  switch (phase) {
    case "INITIAL":
      return Output.object({ schema: InitialOutputSchema });
    case "QUESTIONING":
      return Output.object({ schema: QuestioningOutputSchema });
    case "EXAMINATION":
      return Output.object({ schema: ExaminationOutputSchema });
    case "PROPOSAL":
      return Output.object({ schema: ProposalOutputSchema });
  }
}

function buildClinicContext(context: AgentContext) {
  return {
    name: context.clinicContext.name,
    techniques: context.clinicContext.techniques,
    equipment: context.clinicContext.equipment,
  };
}

/**
 * Inicia una nueva sesión diagnóstica.
 * Genera hipótesis + preguntas discriminatorias (sin tests).
 */
export function startDiagnosticSession(params: {
  selectedZones: Array<{
    region: string;
    side?: string;
    subzone: string;
    symptom: string;
    triggers: string[];
    label: string;
  }>;
  occupationalLoad: string;
  activityVolume: string;
  sportProfile?: SportProfile;
  patientAge?: number;
  functionalAssessments?: FunctionalMovementAssessment[];
  context: AgentContext;
}) {
  const systemPrompt = buildSystemPrompt({
    phase: "INITIAL",
    professionalName: params.context.professionalName,
    clinicContext: buildClinicContext(params.context),
  });

  const userMessage = buildNarrativeMessage(params);

  return streamText({
    model: MODEL,
    output: Output.object({ schema: InitialOutputSchema }),
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
    providerOptions: ANTHROPIC_THINKING_OPTIONS,
  });
}

/**
 * Procesa respuestas a preguntas discriminatorias en lote.
 */
export function submitAnswersSession(params: {
  sessionState: SessionState;
  answers: Array<{
    questionId: string;
    answer: "yes" | "no" | "unclear";
  }>;
  notes?: string;
  context: AgentContext;
}) {
  const systemPrompt = buildSystemPrompt({
    phase: "QUESTIONING",
    professionalName: params.context.professionalName,
    clinicContext: buildClinicContext(params.context),
  });

  const answersText = params.answers
    .map((a) => {
      const q = params.sessionState.discriminatoryQuestions.find(
        (q) => q.id === a.questionId
      );
      return `- "${q?.text ?? a.questionId}": ${a.answer}`;
    })
    .join("\n");

  const notesText = params.notes
    ? `\n\nNotas adicionales del profesional: ${params.notes}`
    : "";

  const newInput = `El profesional ha respondido las siguientes preguntas discriminatorias:\n${answersText}${notesText}\n\nRecalcula el árbol de hipótesis con esta nueva información. Actualiza la cadena causal de cada hipótesis.`;

  const messages = buildConversationMessages(params.sessionState, newInput);

  return streamText({
    model: MODEL,
    output: Output.object({ schema: QuestioningOutputSchema }),
    system: systemPrompt,
    messages,
    providerOptions: ANTHROPIC_THINKING_OPTIONS,
  });
}

/**
 * Procesa resultados de tests clínicos en lote.
 */
export function submitTestResultsSession(params: {
  sessionState: SessionState;
  results: Array<{
    testId: string;
    result: "positive" | "negative" | "inconclusive";
  }>;
  notes?: string;
  context: AgentContext;
}) {
  const systemPrompt = buildSystemPrompt({
    phase: "EXAMINATION",
    professionalName: params.context.professionalName,
    clinicContext: buildClinicContext(params.context),
  });

  const resultsText = params.results
    .map((r) => {
      const t = params.sessionState.clinicalTests.find(
        (t) => t.id === r.testId
      );
      return `- "${t?.name ?? r.testId}": ${r.result}`;
    })
    .join("\n");

  const notesText = params.notes
    ? `\n\nNotas adicionales del profesional: ${params.notes}`
    : "";

  const newInput = `El profesional ha realizado los siguientes tests clínicos:\n${resultsText}${notesText}\n\nInterpreta los resultados y recalcula el árbol de hipótesis. Actualiza la cadena causal.`;

  const messages = buildConversationMessages(params.sessionState, newInput);

  return streamText({
    model: MODEL,
    output: Output.object({ schema: ExaminationOutputSchema }),
    system: systemPrompt,
    messages,
    providerOptions: ANTHROPIC_THINKING_OPTIONS,
  });
}

/**
 * Procesa un input libre del profesional.
 */
export function updateDiagnosticSession(params: {
  sessionState: SessionState;
  newInput: string;
  context: AgentContext;
}) {
  const promptPhase = toPromptPhase(params.sessionState.phase);
  const systemPrompt = buildSystemPrompt({
    phase: promptPhase,
    professionalName: params.context.professionalName,
    clinicContext: buildClinicContext(params.context),
  });

  const messages = buildConversationMessages(
    params.sessionState,
    params.newInput
  );

  return streamText({
    model: MODEL,
    output: outputForPhase(promptPhase),
    system: systemPrompt,
    messages,
    providerOptions: ANTHROPIC_THINKING_OPTIONS,
  });
}

/**
 * Genera una propuesta terapéutica para la hipótesis seleccionada.
 */
export function proposeDiagnosticTherapy(params: {
  sessionState: SessionState;
  selectedHypothesisId: string;
  context: AgentContext;
}) {
  const systemPrompt = buildSystemPrompt({
    phase: "PROPOSAL",
    professionalName: params.context.professionalName,
    clinicContext: buildClinicContext(params.context),
  });

  const selectedHypothesis = params.sessionState.hypotheses.find(
    (h) => h.id === params.selectedHypothesisId
  );

  const messages = buildConversationMessages(
    params.sessionState,
    `Marco ha seleccionado la siguiente hipótesis como diagnóstico principal:
- Músculo: ${selectedHypothesis?.muscle ?? "desconocido"}
- Condición: ${selectedHypothesis?.condition ?? "desconocida"}
- Probabilidad actual: ${selectedHypothesis?.probability ?? 0}%
- Cadena causal: ${selectedHypothesis?.causalChain ?? "no disponible"}

Genera una propuesta terapéutica completa.
Filtra las técnicas por el equipamiento y técnicas disponibles en el contexto de clínica.`
  );

  return streamText({
    model: MODEL,
    output: Output.object({ schema: ProposalOutputSchema }),
    system: systemPrompt,
    messages,
    providerOptions: ANTHROPIC_THINKING_OPTIONS,
  });
}

// ─── Narrative builder (initial message) ───

function buildNarrativeMessage(params: {
  selectedZones: Array<{
    region: string;
    side?: string;
    subzone: string;
    symptom: string;
    triggers: string[];
  }>;
  occupationalLoad: string;
  activityVolume: string;
  sportProfile?: SportProfile;
  patientAge?: number;
  functionalAssessments?: FunctionalMovementAssessment[];
}): string {
  function ordinalLabel(index: number): string {
    if (index === 0) return "Primario";
    if (index === 1) return "Secundario";
    if (index === 2) return "Terciario";
    return `${index + 1}º`;
  }

  const ageFrag = params.patientAge
    ? `Paciente de ${params.patientAge} años`
    : "Paciente (edad no especificada)";

  const occFrag =
    occupationalLabels[params.occupationalLoad] ?? params.occupationalLoad;

  let actFrag =
    activityLabels[params.activityVolume] ?? params.activityVolume;
  if (params.sportProfile) {
    actFrag += `, practica ${params.sportProfile.sportType}`;
    if (params.sportProfile.roleOrPosition) {
      actFrag += ` (${params.sportProfile.roleOrPosition})`;
    }
    if (params.sportProfile.details) {
      actFrag += `, ${params.sportProfile.details}`;
    }
  }

  const zoneNarratives = params.selectedZones.map((z) => {
    const side =
      z.side === "left"
        ? " izquierdo/a"
        : z.side === "right"
          ? " derecho/a"
          : "";
    const triggers =
      z.triggers.length > 0
        ? `. Aparece: ${z.triggers.join(", ").toLowerCase()}`
        : "";
    const movementDescribedNote = z.triggers.some(
      (t) => t.toLowerCase() === "movimiento descrito"
    )
      ? '. Nota: "Movimiento descrito" se refiere al movimiento descrito en el paso 4 (síntomas) de esta misma zona.'
      : "";
    const sportTriggerNote = z.triggers.some((t) => {
      const lower = t.toLowerCase();
      return (
        lower === "durante actividad deportiva" ||
        lower === "tras actividad deportiva"
      );
    })
      ? '. Nota: los triggers de actividad deportiva se refieren a la actividad/deporte indicado en el paso 1 del perfil del paciente.'
      : "";
    return `${z.symptom} en ${z.subzone} de ${z.region}${side}${triggers}${movementDescribedNote}${sportTriggerNote}`;
  });

  const functionalAssessmentsText =
    params.functionalAssessments && params.functionalAssessments.length > 0
      ? params.functionalAssessments
          .map((fa, index) => {
            const rom =
              typeof fa.romRangeDegrees === "number"
                ? `ROM: ${fa.romRangeDegrees}°`
                : "ROM: no medido";
            const painOnset =
              typeof fa.painStartsAtDegrees === "number"
                ? `inicio dolor: ${fa.painStartsAtDegrees}°`
                : "inicio dolor: no referido";
            const notes = fa.notes ? `; notas: ${fa.notes}` : "";
            const role = ordinalLabel((fa.order ?? index + 1) - 1);
            return `- ${role}: ${fa.jointStructure} | ${fa.movement} | provocación: ${fa.provocationType} | condición: ${fa.mechanicalCondition} | dolor: ${fa.painReproduced ? "sí" : "no"} | limitación: ${fa.rangeLimited ? "sí" : "no"} | sensación: ${fa.dominantSensation} | ${rom} | ${painOnset}${notes}`;
          })
          .join("\n")
      : "- Sin registro mecánico funcional inicial.";

  return `Caso clínico:
${ageFrag}, ${occFrag}, ${actFrag}.

Motivo de consulta: ${zoneNarratives.join(". ")}.

Perfil mecánico funcional inicial (Paso 3):
${functionalAssessmentsText}

IMPORTANTE: Cada hipótesis debe incluir una CADENA CAUSAL (campo causalChain) que explique por qué esta patología en ESTE paciente concreto — conectando perfil ocupacional, actividad deportiva, gestos desencadenantes y zona de dolor. No basta con nombrar la estructura y la probabilidad.

Aplica razonamiento de dolor referido desde el inicio. La zona reportada es el punto de entrada — incluye hipótesis TYPE A (local) y TYPE B (origen referido).

Genera el árbol de hipótesis. Incluye las 2-3 preguntas más discriminatorias. NO sugieras tests clínicos todavía. Si detectas red flags, inclúyelos en el array redFlags.`;
}

// ─── Conversation context builder ───

function buildConversationMessages(
  sessionState: SessionState,
  newInput: string
) {
  function ordinalLabel(index: number): string {
    if (index === 0) return "Primario";
    if (index === 1) return "Secundario";
    if (index === 2) return "Terciario";
    return `${index + 1}º`;
  }

  const zonesStr = sessionState.selectedZones
    .map(
      (z) =>
        z.label +
        (z.triggers.length > 0
          ? ` (triggers: ${z.triggers.join(", ")}${z.triggers.some((t) => t.toLowerCase() === "movimiento descrito") ? "; 'Movimiento descrito' = movimiento descrito en paso 4" : ""}${z.triggers.some((t) => {
              const lower = t.toLowerCase();
              return (
                lower === "durante actividad deportiva" ||
                lower === "tras actividad deportiva"
              );
            }) ? "; actividad deportiva = deporte indicado en paso 1" : ""})`
          : "")
    )
    .join("; ");

  const occLabel =
    occupationalLabels[sessionState.occupationalLoad] ??
    sessionState.occupationalLoad;
  const actLabel =
    activityLabels[sessionState.activityVolume] ??
    sessionState.activityVolume;
  const sportStr = sessionState.sportProfile
    ? `, ${sessionState.sportProfile.sportType}${sessionState.sportProfile.roleOrPosition ? ` (${sessionState.sportProfile.roleOrPosition})` : ""}${sessionState.sportProfile.details ? `, ${sessionState.sportProfile.details}` : ""}`
    : "";
  const profileNarrative = `${occLabel}, ${actLabel}${sportStr}`;

  const activeHypotheses = sessionState.hypotheses
    .filter((h) => h.isActive)
    .map(
      (h) =>
        `- [${h.probability}%] ${h.muscle} — ${h.condition}: ${h.justification}${h.causalChain ? `\n  Cadena causal: ${h.causalChain}` : ""}`
    )
    .join("\n");

  const answeredQuestions = sessionState.discriminatoryQuestions
    .filter((q) => q.answer)
    .map((q) => `- ${q.text}: ${q.answer}`)
    .join("\n");

  const completedTests = sessionState.clinicalTests
    .filter((t) => t.result)
    .map((t) => `- ${t.name}: ${t.result}`)
    .join("\n");

  const redFlags = sessionState.redFlags
    .map((rf) => `- [${rf.severity}] ${rf.symptom}: ${rf.recommendation}`)
    .join("\n");

  const functionalAssessments = sessionState.functionalAssessments
    .map((fa, index) => {
      const rom =
        typeof fa.romRangeDegrees === "number"
          ? `ROM ${fa.romRangeDegrees}°`
          : "ROM no medido";
      const painOnset =
        typeof fa.painStartsAtDegrees === "number"
          ? `dolor desde ${fa.painStartsAtDegrees}°`
          : "inicio dolor no referido";
      const role = ordinalLabel((fa.order ?? index + 1) - 1);
      return `- ${role}: ${fa.jointStructure} | ${fa.movement} | ${fa.provocationType} | ${fa.mechanicalCondition} | dolor ${fa.painReproduced ? "sí" : "no"} | limitación ${fa.rangeLimited ? "sí" : "no"} | ${fa.dominantSensation} | ${rom} | ${painOnset}`;
    })
    .join("\n");

  const stateContext = `Estado actual de la sesión:
- Fase: ${sessionState.phase}
- Zonas de dolor: ${zonesStr}
- Perfil: ${profileNarrative}${sessionState.patientAge ? `, ${sessionState.patientAge} años` : ""}

Hipótesis activas:
${activeHypotheses || "(ninguna todavía)"}

Preguntas respondidas:
${answeredQuestions || "(ninguna todavía)"}

Tests completados:
${completedTests || "(ninguno todavía)"}

Red flags detectados:
${redFlags || "(ninguno)"}`;

  const functionalContext = `Perfil mecánico funcional (Paso 3):
${functionalAssessments || "(sin registro)"}`;

  return [
    {
      role: "user" as const,
      content: `${stateContext}\n\n${functionalContext}`,
    },
    {
      role: "user" as const,
      content: `${newInput}\n\nAplica razonamiento de dolor referido y mantén las cadenas causales actualizadas.`,
    },
  ];
}
