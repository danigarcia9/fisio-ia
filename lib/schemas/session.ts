import { z } from "zod/v4";

// --- Selected Zone ---

export const SelectedZoneSchema = z.object({
  id: z.string(),
  region: z.string(),
  side: z.enum(["left", "right"]).optional(),
  subzone: z.string(),
  symptom: z.string(),
  triggers: z.array(z.string()),
  label: z.string(),
});
export type SelectedZone = z.infer<typeof SelectedZoneSchema>;

// --- Patient Profile ---

export const patientProfiles = [
  "sedentary",
  "amateur_athlete",
  "elite_athlete",
  "physical_work",
] as const;

export const PatientProfileSchema = z.enum(patientProfiles);
export type PatientProfile = z.infer<typeof PatientProfileSchema>;

// --- Hypothesis ---

export const HypothesisSchema = z.object({
  id: z.string(),
  muscle: z.string(),
  condition: z.string(),
  probability: z.number().min(0).max(100),
  justification: z.string(),
  isActive: z.boolean(),
  confirmedByTest: z.string().optional(),
  discardedReason: z.string().optional(),
});
export type Hypothesis = z.infer<typeof HypothesisSchema>;

// --- Question ---

export const QuestionSchema = z.object({
  id: z.string(),
  text: z.string(),
  discriminatoryPower: z.enum(["high", "medium", "low"]),
  targetHypotheses: z.array(z.string()),
  answer: z.enum(["yes", "no", "unclear"]).optional(),
  answeredAt: z.string().optional(),
});
export type Question = z.infer<typeof QuestionSchema>;

// --- Red Flag ---

export const RedFlagSchema = z.object({
  id: z.string(),
  symptom: z.string(),
  severity: z.enum(["urgent", "warning"]),
  recommendation: z.string(),
  detectedAt: z.string(),
});
export type RedFlag = z.infer<typeof RedFlagSchema>;

// --- Clinical Test ---

export const ClinicalTestSchema = z.object({
  id: z.string(),
  name: z.string(),
  howToExecute: z.string(),
  positiveResult: z.string(),
  negativeResult: z.string(),
  targetHypotheses: z.array(z.string()),
  result: z.enum(["positive", "negative", "inconclusive"]).optional(),
  executedAt: z.string().optional(),
});
export type ClinicalTest = z.infer<typeof ClinicalTestSchema>;

// --- Therapy Proposal ---

export const TherapyTechniqueSchema = z.object({
  name: z.string(),
  description: z.string(),
  available: z.boolean(),
  alternative: z.string().optional(),
});

export const DryNeedlingSchema = z.object({
  muscle: z.string(),
  technique: z.string(),
  patientPosition: z.string(),
  needleSize: z.string(),
  depth: z.string(),
  angle: z.string(),
  precautions: z.array(z.string()),
});

export const ExerciseSchema = z.object({
  name: z.string(),
  description: z.string(),
  sets: z.string(),
  frequency: z.string(),
});

export const TherapyProposalSchema = z.object({
  diagnosis: z.string(),
  techniques: z.array(TherapyTechniqueSchema),
  dryNeedling: DryNeedlingSchema.optional(),
  exercises: z.array(ExerciseSchema),
  sessionFrequency: z.string(),
  expectedEvolution: z.string(),
  followUpSigns: z.array(z.string()),
});
export type TherapyProposal = z.infer<typeof TherapyProposalSchema>;

// --- Session Events ---

export const SessionEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("question_answered"),
    questionId: z.string(),
    answer: z.enum(["yes", "no", "unclear"]),
    timestamp: z.string(),
  }),
  z.object({
    type: z.literal("test_result"),
    testId: z.string(),
    result: z.enum(["positive", "negative", "inconclusive"]),
    timestamp: z.string(),
  }),
  z.object({
    type: z.literal("free_input"),
    text: z.string(),
    timestamp: z.string(),
  }),
  z.object({
    type: z.literal("hypothesis_confirmed"),
    hypothesisId: z.string(),
    timestamp: z.string(),
  }),
  z.object({
    type: z.literal("hypothesis_discarded"),
    hypothesisId: z.string(),
    reason: z.string(),
    timestamp: z.string(),
  }),
  z.object({
    type: z.literal("hypothesis_reopened"),
    hypothesisId: z.string(),
    timestamp: z.string(),
  }),
  z.object({
    type: z.literal("treatment_failed"),
    description: z.string(),
    timestamp: z.string(),
  }),
]);
export type SessionEvent = z.infer<typeof SessionEventSchema>;

// --- Session Phase ---

export const sessionPhases = [
  "initial",
  "questioning",
  "examination",
  "therapy_proposal",
  "closed",
] as const;

export const SessionPhaseSchema = z.enum(sessionPhases);
export type SessionPhase = z.infer<typeof SessionPhaseSchema>;

// --- Session State ---

export const SessionStateSchema = z.object({
  id: z.string(),
  startedAt: z.string(),

  // Patient inputs
  selectedZones: z.array(SelectedZoneSchema),
  patientProfile: PatientProfileSchema,
  patientAge: z.number().optional(),
  patientHabits: z.array(z.string()).optional(),
  contextId: z.string(),

  // Session history
  history: z.array(SessionEventSchema),

  // Current diagnostic state
  hypotheses: z.array(HypothesisSchema),
  discriminatoryQuestions: z.array(QuestionSchema),
  clinicalTests: z.array(ClinicalTestSchema),
  redFlags: z.array(RedFlagSchema),

  // Therapy proposal (generated at the end)
  therapyProposal: TherapyProposalSchema.optional(),

  // Session phase
  phase: SessionPhaseSchema,
});
export type SessionState = z.infer<typeof SessionStateSchema>;

// --- API Request Schemas ---

export const StartSessionRequestSchema = z.object({
  selectedZones: z.array(SelectedZoneSchema).min(1),
  patientProfile: PatientProfileSchema,
  patientAge: z.number().min(0).max(120).optional(),
  patientHabits: z.array(z.string()).optional(),
  contextId: z.string(),
});
export type StartSessionRequest = z.infer<typeof StartSessionRequestSchema>;

export const UpdateSessionRequestSchema = z.object({
  sessionState: SessionStateSchema,
  newInput: SessionEventSchema,
});
export type UpdateSessionRequest = z.infer<typeof UpdateSessionRequestSchema>;

export const ProposeTherapyRequestSchema = z.object({
  sessionState: SessionStateSchema,
  selectedHypothesisId: z.string(),
});
export type ProposeTherapyRequest = z.infer<typeof ProposeTherapyRequestSchema>;
