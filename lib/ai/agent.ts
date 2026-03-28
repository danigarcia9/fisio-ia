import { streamText, stepCountIs } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { buildSystemPrompt } from "./prompts";
import type { PromptPhase } from "./prompts";
import { diagnosticTools } from "./tools";
import type { SessionState, SessionPhase } from "@/lib/schemas/session";
import type { ClinicContext } from "@/lib/schemas/profile";

const MODEL = anthropic("claude-sonnet-4-6");

interface AgentContext {
  professionalName: string;
  clinicContext: ClinicContext;
}

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

/**
 * Inicia una nueva sesión diagnóstica.
 * Recibe las zonas de dolor, perfil del paciente y contexto de clínica.
 * Devuelve un stream con la primera iteración del árbol de hipótesis.
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
  patientProfile: string;
  patientAge?: number;
  patientHabits?: string[];
  context: AgentContext;
}) {
  const systemPrompt = buildSystemPrompt({
    phase: "INITIAL",
    professionalName: params.context.professionalName,
    clinicContext: {
      name: params.context.clinicContext.name,
      techniques: params.context.clinicContext.techniques,
      equipment: params.context.clinicContext.equipment,
    },
  });

  const userMessage = buildInitialMessage(
    params.selectedZones,
    params.patientProfile,
    params.patientAge,
    params.patientHabits
  );

  return streamText({
    model: MODEL,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
    tools: diagnosticTools,
    stopWhen: stepCountIs(3),
  });
}

/**
 * Procesa un nuevo input dentro de una sesión existente.
 * Envía el estado completo de la sesión + el nuevo input al agente.
 * El agente recalcula hipótesis y genera nuevas preguntas si es necesario.
 */
export function updateDiagnosticSession(params: {
  sessionState: SessionState;
  newInput: string;
  context: AgentContext;
}) {
  const systemPrompt = buildSystemPrompt({
    phase: toPromptPhase(params.sessionState.phase),
    professionalName: params.context.professionalName,
    clinicContext: {
      name: params.context.clinicContext.name,
      techniques: params.context.clinicContext.techniques,
      equipment: params.context.clinicContext.equipment,
    },
  });

  const messages = buildConversationMessages(
    params.sessionState,
    params.newInput
  );

  return streamText({
    model: MODEL,
    system: systemPrompt,
    messages,
    tools: diagnosticTools,
    stopWhen: stepCountIs(3),
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
    clinicContext: {
      name: params.context.clinicContext.name,
      techniques: params.context.clinicContext.techniques,
      equipment: params.context.clinicContext.equipment,
    },
  });

  const selectedHypothesis = params.sessionState.hypotheses.find(
    (h) => h.id === params.selectedHypothesisId
  );

  const messages = buildConversationMessages(
    params.sessionState,
    `Marco has selected the following hypothesis as the primary diagnosis:
- Muscle: ${selectedHypothesis?.muscle ?? "unknown"}
- Condition: ${selectedHypothesis?.condition ?? "unknown"}
- Current probability: ${selectedHypothesis?.probability ?? 0}%

Generate a complete therapy proposal using the proposeTherapy tool.
Filter techniques by the available equipment and techniques in the clinic context.`
  );

  return streamText({
    model: MODEL,
    system: systemPrompt,
    messages,
    tools: diagnosticTools,
    stopWhen: stepCountIs(3),
  });
}

// --- Helper functions ---

function buildInitialMessage(
  selectedZones: Array<{
    region: string;
    side?: string;
    subzone: string;
    symptom: string;
    triggers: string[];
    label: string;
  }>,
  patientProfile: string,
  patientAge?: number,
  patientHabits?: string[]
): string {
  const profileLabels: Record<string, string> = {
    sedentary: "sedentary",
    amateur_athlete: "amateur athlete",
    elite_athlete: "elite/high-performance athlete",
    physical_work: "physical/manual labor",
  };

  const profile = profileLabels[patientProfile] || patientProfile;
  const ageStr = patientAge ? `\n- Age: ${patientAge}` : "";
  const habitsStr =
    patientHabits && patientHabits.length > 0
      ? `\n- Habits/activity: ${patientHabits.join(", ")}`
      : "";

  const zonesText = selectedZones
    .map((z) => {
      const sideStr =
        z.side === "left" ? " (left)" : z.side === "right" ? " (right)" : "";
      const triggersStr =
        z.triggers.length > 0
          ? `\n  Pain triggers: ${z.triggers.join(", ")}`
          : "";
      return `- Region: ${z.region}${sideStr}\n  Sub-zone: ${z.subzone}\n  Primary symptom: ${z.symptom}${triggersStr}`;
    })
    .join("\n");

  return `New patient case:
- Patient profile: ${profile}${ageStr}${habitsStr}

Reported pain zone(s):
${zonesText}

IMPORTANT: Apply referred pain reasoning from the start.
The reported zone is the entry point — include both TYPE A (local) and
TYPE B (referred origin) hypotheses in the initial tree.

Generate the initial hypothesis tree using the updateHypotheses tool.
Include the 2-3 most discriminatory questions.
If you detect potential red flags, use the flagRedFlag tool.`;
}

function buildConversationMessages(
  sessionState: SessionState,
  newInput: string
) {
  const zonesStr = sessionState.selectedZones
    .map(
      (z) =>
        z.label +
        (z.triggers.length > 0 ? ` (triggers: ${z.triggers.join(", ")})` : "")
    )
    .join("; ");

  const habitsStr = sessionState.patientHabits?.join(", ") || "not specified";

  const activeHypotheses = sessionState.hypotheses
    .filter((h) => h.isActive)
    .map(
      (h) =>
        `- [${h.probability}%] ${h.muscle} — ${h.condition}: ${h.justification}`
    )
    .join("\n");

  const answeredQuestions = sessionState.history
    .filter((e) => e.type === "question_answered")
    .map((e) => {
      if (e.type === "question_answered") {
        const q = sessionState.discriminatoryQuestions.find(
          (dq) => dq.id === e.questionId
        );
        return `- ${q?.text ?? e.questionId}: ${e.answer}`;
      }
      return "";
    })
    .join("\n");

  const completedTests = sessionState.history
    .filter((e) => e.type === "test_result")
    .map((e) => {
      if (e.type === "test_result") {
        const t = sessionState.clinicalTests.find((ct) => ct.id === e.testId);
        return `- ${t?.name ?? e.testId}: ${e.result}`;
      }
      return "";
    })
    .join("\n");

  const redFlags = sessionState.redFlags
    .map((rf) => `- [${rf.severity}] ${rf.symptom}: ${rf.recommendation}`)
    .join("\n");

  const stateContext = `Current session state:
- Phase: ${sessionState.phase}
- Pain zones: ${zonesStr}
- Habits: ${habitsStr}
- Profile: ${sessionState.patientProfile}${sessionState.patientAge ? `, ${sessionState.patientAge} years old` : ""}

Active hypotheses:
${activeHypotheses || "(none yet)"}

Answered questions:
${answeredQuestions || "(none yet)"}

Completed tests:
${completedTests || "(none yet)"}

Detected red flags:
${redFlags || "(none)"}`;

  return [
    {
      role: "user" as const,
      content: stateContext,
    },
    {
      role: "user" as const,
      content: `New input from the professional:\n${newInput}\n\nRecalculate the hypothesis tree using updateHypotheses based on this new information. Apply referred pain reasoning throughout.`,
    },
  ];
}
