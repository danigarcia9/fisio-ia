import { z } from "zod/v4";

// ─── Shared sub-schemas ───

const HypothesisOutputSchema = z.object({
  id: z.string().describe("Unique ID, e.g. 'h1', 'h2'"),
  muscle: z
    .string()
    .describe("Affected muscle or structure, e.g. 'Infraespinoso'"),
  condition: z
    .string()
    .describe("Condition/pathology, e.g. 'Tendinopatía del infraespinoso'"),
  probability: z
    .number()
    .describe("Estimated probability 0-100"),
  justification: z
    .string()
    .describe("Brief justification for the assigned probability"),
  causalChain: z.string().describe(
    "Causal chain: explains WHY this pathology in THIS specific patient. " +
      "Connects occupational profile + sports activity + triggering gesture + pain zone. " +
      "Example: 'Oficina 8h → flexión mantenida → acortamiento pectoral → " +
      "punto gatillo infraespinoso → dolor referido hombro anterior'"
  ),
});

const QuestionOptionSchema = z.object({
  id: z.string().describe("Unique option ID, e.g. 'q1_a', 'q1_b'"),
  label: z
    .string()
    .describe(
      "Short button label in Spanish (max ~8 words), e.g. 'Más como un salto por dentro'"
    ),
  value: z
    .string()
    .describe(
      "Internal semantic value for this option, e.g. 'snap_internal', 'grinding_surface'"
    ),
});

const QuestionOutputSchema = z.object({
  id: z.string().describe("Unique ID, e.g. 'q1', 'q2'"),
  text: z
    .string()
    .describe(
      "Question text in Spanish, patient-friendly conversational language"
    ),
  options: z
    .array(QuestionOptionSchema)
    .describe(
      "2-3 specific answer options tailored to this question. " +
        "Each option should represent a distinct clinical scenario the patient might describe. " +
        "Always include a final 'No claro' / 'No estoy seguro' option. " +
        "NEVER use generic 'Sí' / 'No' — options must be descriptive and specific to the question."
    ),
  discriminatoryPower: z.enum(["high", "medium", "low"]),
  targetHypotheses: z
    .array(z.string())
    .describe("IDs of hypotheses this question helps discriminate"),
});

const RedFlagOutputSchema = z.object({
  symptom: z.string().describe("Description of the alarming symptom"),
  severity: z
    .enum(["urgent", "warning"])
    .describe("'urgent' = immediate referral, 'warning' = monitor"),
  recommendation: z
    .string()
    .describe("Specific recommendation for the professional"),
});

const ClinicalTestOutputSchema = z.object({
  id: z.string().describe("Unique ID, e.g. 't1', 't2'"),
  name: z.string().describe("Name of the clinical test"),
  howToExecute: z
    .string()
    .describe("Step-by-step execution instructions"),
  positiveResult: z
    .string()
    .describe("What a positive result indicates"),
  negativeResult: z
    .string()
    .describe("What a negative result indicates"),
  targetHypotheses: z
    .array(z.string())
    .describe("IDs of hypotheses this test helps confirm/rule out"),
});

// ─── Phase output schemas ───

export const InitialOutputSchema = z.object({
  reasoning: z
    .string()
    .describe(
      "Brief clinical reasoning explanation in Spanish. Show your thinking."
    ),
  hypotheses: z
    .array(HypothesisOutputSchema)
    .describe(
      "4-6 hypotheses mixing TYPE A (local) and TYPE B (referred origin), ordered by probability."
    ),
  discriminatoryQuestions: z
    .array(QuestionOutputSchema)
    .describe(
      "2-3 most discriminatory questions. First priority: distinguish local vs referred."
    ),
  redFlags: z
    .array(RedFlagOutputSchema)
    .describe("Red flags detected. Empty array if none."),
});
export type InitialOutput = z.infer<typeof InitialOutputSchema>;

export const QuestioningOutputSchema = z.object({
  reasoning: z
    .string()
    .describe(
      "Explain how the answers changed the hypothesis tree. In Spanish."
    ),
  hypotheses: z
    .array(HypothesisOutputSchema)
    .describe("Updated hypothesis tree with recalculated probabilities."),
  discriminatoryQuestions: z
    .array(QuestionOutputSchema)
    .describe(
      "New questions if tree hasn't converged (top hypothesis < 60%). Empty array if ready for tests."
    ),
  clinicalTests: z
    .array(ClinicalTestOutputSchema)
    .describe(
      "Clinical tests if hypotheses have converged (top hypothesis >= 60%). Empty array if more questions needed."
    ),
  redFlags: z
    .array(RedFlagOutputSchema)
    .describe("Red flags detected. Empty array if none."),
  nextPhase: z
    .enum(["questioning", "examination"])
    .describe(
      "'questioning' if you generated more questions, 'examination' if you generated clinical tests"
    ),
});
export type QuestioningOutput = z.infer<typeof QuestioningOutputSchema>;

export const ExaminationOutputSchema = z.object({
  reasoning: z
    .string()
    .describe(
      "Interpretation of test results and their impact on hypotheses. In Spanish."
    ),
  hypotheses: z
    .array(HypothesisOutputSchema)
    .describe("Updated hypothesis tree after test results."),
  clinicalTests: z
    .array(ClinicalTestOutputSchema)
    .describe(
      "Additional tests if more exploration needed. Empty array if clinical picture is clear."
    ),
  redFlags: z
    .array(RedFlagOutputSchema)
    .describe("Red flags detected. Empty array if none."),
  readyForProposal: z
    .boolean()
    .describe(
      "true if the clinical picture is clear enough for a therapy proposal"
    ),
});
export type ExaminationOutput = z.infer<typeof ExaminationOutputSchema>;

export const ProposalOutputSchema = z.object({
  reasoning: z
    .string()
    .describe(
      "Summary of clinical picture: patient profile, pain zone, confirmed diagnosis, key finding. In Spanish."
    ),
  diagnosis: z.string().describe("Final confirmed diagnosis"),
  techniques: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      available: z
        .boolean()
        .describe("Whether available in the clinic context"),
      alternative: z
        .string()
        .optional()
        .describe("Alternative if main technique unavailable"),
    })
  ),
  dryNeedling: z
    .object({
      muscle: z.string(),
      technique: z.string(),
      patientPosition: z.string(),
      needleSize: z.string(),
      depth: z.string(),
      angle: z.string(),
      precautions: z.array(z.string()),
    })
    .optional()
    .describe("Dry needling protocol if applicable"),
  exercises: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      sets: z.string(),
      frequency: z.string(),
    })
  ),
  sessionFrequency: z.string(),
  expectedEvolution: z.string(),
  followUpSigns: z.array(z.string()),
});
export type ProposalOutput = z.infer<typeof ProposalOutputSchema>;
