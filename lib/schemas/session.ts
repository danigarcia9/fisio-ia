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
  functionalInputs: z
    .array(
      z.object({
        jointStructure: z.string(),
        movement: z.string(),
        provocationType: z.string(),
        mechanicalCondition: z.string(),
        romRangeDegrees: z.number().min(0).max(180).optional(),
        painStartsAtDegrees: z.number().min(0).max(180).optional(),
      })
    )
    .optional(),
});
export type SelectedZone = z.infer<typeof SelectedZoneSchema>;

// --- Patient Profile (3 dimensions) ---

export const occupationalLoadOptions = [
  "sedentary",
  "prolonged_standing",
  "moderate_physical",
  "heavy_physical",
] as const;

export const OccupationalLoadSchema = z.enum(occupationalLoadOptions);
export type OccupationalLoad = z.infer<typeof OccupationalLoadSchema>;

export const activityVolumeOptions = [
  "none",
  "recreational",
  "regular",
  "high_performance",
] as const;

export const ActivityVolumeSchema = z.enum(activityVolumeOptions);
export type ActivityVolume = z.infer<typeof ActivityVolumeSchema>;

export const SportProfileSchema = z.object({
  sportType: z.string(),
  roleOrPosition: z.string().optional(),
  details: z.string().optional(),
});
export type SportProfile = z.infer<typeof SportProfileSchema>;

// --- Functional Movement Assessment (Step 3) ---

export const jointStructureOptions = [
  "shoulder",
  "elbow",
  "wrist",
  "cervical",
  "lumbar",
  "hip",
  "knee",
  "ankle",
] as const;

export const JointStructureSchema = z.enum(jointStructureOptions);
export type JointStructure = z.infer<typeof JointStructureSchema>;

export const movementOptions = [
  "flexion",
  "extension",
  "abduction",
  "adduction",
  "internal_rotation",
  "external_rotation",
  "pronation",
  "supination",
  "radial_deviation",
  "ulnar_deviation",
  "ipsilateral_inclination",
  "contralateral_inclination",
  "ipsilateral_rotation",
  "contralateral_rotation",
  "dorsiflexion",
  "plantarflexion",
  "inversion",
  "eversion",
  "forced_valgus",
  "forced_varus",
  "dynamic_valgus",
  "dynamic_varus",
] as const;

export const MovementSchema = z.enum(movementOptions);
export type Movement = z.infer<typeof MovementSchema>;

export const provocationTypeOptions = [
  "active_contraction",
  "passive_stretch",
  "active_stretch",
  "resisted",
  "passive_mobility",
] as const;

export const ProvocationTypeSchema = z.enum(provocationTypeOptions);
export type ProvocationType = z.infer<typeof ProvocationTypeSchema>;

export const mechanicalConditionOptions = [
  "unloaded",
  "loaded",
  "compression",
  "loaded_compression",
] as const;

export const MechanicalConditionSchema = z.enum(mechanicalConditionOptions);
export type MechanicalCondition = z.infer<typeof MechanicalConditionSchema>;

export const dominantSensationOptions = [
  "pain",
  "stiffness",
  "blocking",
  "instability",
] as const;

export const DominantSensationSchema = z.enum(dominantSensationOptions);
export type DominantSensation = z.infer<typeof DominantSensationSchema>;

export const FunctionalMovementAssessmentSchema = z.object({
  id: z.string(),
  order: z.number().int().min(1).optional(),
  jointStructure: JointStructureSchema,
  movement: MovementSchema,
  provocationType: ProvocationTypeSchema,
  mechanicalCondition: MechanicalConditionSchema,
  painReproduced: z.boolean().optional(),
  rangeLimited: z.boolean().optional(),
  dominantSensation: DominantSensationSchema.optional(),
  romRangeDegrees: z.number().min(0).max(180).optional(),
  painStartsAtDegrees: z.number().min(0).max(180).optional(),
  notes: z.string().optional(),
});
export type FunctionalMovementAssessment = z.infer<
  typeof FunctionalMovementAssessmentSchema
>;

// --- Hypothesis ---

export const HypothesisSchema = z.object({
  id: z.string(),
  muscle: z.string(),
  condition: z.string(),
  probability: z.number().min(0).max(100),
  justification: z.string(),
  causalChain: z.string().optional(),
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
  z.object({
    type: z.literal("submit_answers"),
    answers: z.array(
      z.object({
        questionId: z.string(),
        answer: z.enum(["yes", "no", "unclear"]),
      })
    ),
    notes: z.string().optional(),
    timestamp: z.string(),
  }),
  z.object({
    type: z.literal("submit_test_results"),
    results: z.array(
      z.object({
        testId: z.string(),
        result: z.enum(["positive", "negative", "inconclusive"]),
      })
    ),
    notes: z.string().optional(),
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

  // Patient inputs (3 dimensions)
  selectedZones: z.array(SelectedZoneSchema),
  occupationalLoad: OccupationalLoadSchema,
  activityVolume: ActivityVolumeSchema,
  sportProfile: SportProfileSchema.optional(),
  patientAge: z.number().optional(),
  contextId: z.string(),
  functionalAssessments: z
    .array(FunctionalMovementAssessmentSchema)
    .default([]),

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
  occupationalLoad: OccupationalLoadSchema,
  activityVolume: ActivityVolumeSchema,
  sportProfile: SportProfileSchema.optional(),
  patientAge: z.number().min(0).max(120).optional(),
  contextId: z.string(),
  functionalAssessments: z
    .array(FunctionalMovementAssessmentSchema)
    .default([]),
});
export type StartSessionRequest = z.infer<typeof StartSessionRequestSchema>;

export const UpdateSessionRequestSchema = z.object({
  sessionState: SessionStateSchema,
  newInput: SessionEventSchema,
});
export type UpdateSessionRequest = z.infer<typeof UpdateSessionRequestSchema>;

export const SubmitAnswersRequestSchema = z.object({
  sessionState: SessionStateSchema,
  answers: z.array(
    z.object({
      questionId: z.string(),
      answer: z.enum(["yes", "no", "unclear"]),
    })
  ),
  notes: z.string().optional(),
});
export type SubmitAnswersRequest = z.infer<typeof SubmitAnswersRequestSchema>;

export const SubmitTestResultsRequestSchema = z.object({
  sessionState: SessionStateSchema,
  results: z.array(
    z.object({
      testId: z.string(),
      result: z.enum(["positive", "negative", "inconclusive"]),
    })
  ),
  notes: z.string().optional(),
});
export type SubmitTestResultsRequest = z.infer<
  typeof SubmitTestResultsRequestSchema
>;

export const ProposeTherapyRequestSchema = z.object({
  sessionState: SessionStateSchema,
  selectedHypothesisId: z.string(),
});
export type ProposeTherapyRequest = z.infer<typeof ProposeTherapyRequestSchema>;
