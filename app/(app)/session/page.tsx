"use client";

import { useState, useCallback, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Wizard } from "@/components/wizard/Wizard";
import type { WizardResult } from "@/components/wizard/Wizard";
import { HypothesisTree } from "@/components/session/HypothesisTree";
import { QuestionPanel } from "@/components/session/QuestionPanel";
import { ClinicalTests } from "@/components/session/ClinicalTests";
import { RedFlagAlert } from "@/components/session/RedFlagAlert";
import { TherapyProposal } from "@/components/session/TherapyProposal";
import { FeedbackModal } from "@/components/session/FeedbackModal";
import { useSessionStream } from "@/lib/hooks/useSessionStream";
import {
  OCCUPATIONAL_LOAD_LABELS,
  ACTIVITY_VOLUME_LABELS,
} from "@/lib/data/zones";
import type {
  SessionState,
  Hypothesis,
  TherapyProposal as TherapyProposalType,
} from "@/lib/schemas/session";
import { SessionStateSchema } from "@/lib/schemas/session";
import type {
  DiagnosticAccuracy,
  Utility,
  Difficulty,
  ReasoningFailure,
} from "@/lib/schemas/feedback";
import { ThemeToggle } from "@/components/theme-toggle";
import { Spinner } from "@/components/ui/spinner";

const SESSION_DRAFT_STORAGE_KEY = "fisioia:session-draft:v1";

function createEmptySession(): SessionState {
  return {
    id: uuidv4(),
    startedAt: new Date().toISOString(),
    selectedZones: [],
    occupationalLoad: "sedentary",
    activityVolume: "none",
    sportProfile: undefined,
    patientAge: undefined,
    contextId: "default",
    functionalAssessments: [],
    history: [],
    hypotheses: [],
    discriminatoryQuestions: [],
    clinicalTests: [],
    redFlags: [],
    therapyProposal: undefined,
    phase: "initial",
  };
}

// ─── Main page ───

export default function SessionPage() {
  const [session, setSession] = useState<SessionState>(createEmptySession);
  const [freeInput, setFreeInput] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSavingFeedback, setIsSavingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // Batch answer/test state
  const [pendingAnswers, setPendingAnswers] = useState<
    Record<string, string>
  >({});
  const [pendingTestResults, setPendingTestResults] = useState<
    Record<string, "positive" | "negative" | "inconclusive">
  >({});
  const [questionNotes, setQuestionNotes] = useState("");
  const [testNotes, setTestNotes] = useState("");

  const { isStreaming, stream, abort } = useSessionStream();

  const isActive = session.phase !== "initial" && session.phase !== "closed";
  const isInitial = session.phase === "initial";

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SESSION_DRAFT_STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as SessionState;
      const validated = SessionStateSchema.parse(parsed);

      if (validated.phase !== "closed") {
        setSession(validated);
      } else {
        window.localStorage.removeItem(SESSION_DRAFT_STORAGE_KEY);
      }
    } catch {
      window.localStorage.removeItem(SESSION_DRAFT_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    try {
      if (session.phase === "initial" || session.phase === "closed") {
        window.localStorage.removeItem(SESSION_DRAFT_STORAGE_KEY);
        return;
      }

      window.localStorage.setItem(
        SESSION_DRAFT_STORAGE_KEY,
        JSON.stringify(session)
      );
    } catch {
      // Ignore localStorage write failures (private mode/quota)
    }
  }, [session]);

  // ─── Apply partial/full data to session ───
  const applyStreamData = useCallback(
    (data: Record<string, unknown>, isFinal: boolean) => {
      setSession((prev) => {
        const updates: Partial<SessionState> = {};

        if (Array.isArray(data.hypotheses)) {
          const hyps = (
            data.hypotheses as Array<{
              id: string;
              muscle: string;
              condition: string;
              probability: number;
              justification: string;
              causalChain?: string;
            }>
          ).map((h) => ({ ...h, isActive: true }));
          updates.hypotheses = mergeHypotheses(prev.hypotheses, hyps);
        }

        if (Array.isArray(data.discriminatoryQuestions)) {
          const qs = data.discriminatoryQuestions as Array<{
            id: string;
            text: string;
            options?: Array<{ id: string; label: string; value: string }>;
            discriminatoryPower: "high" | "medium" | "low";
            targetHypotheses: string[];
          }>;
          updates.discriminatoryQuestions = [
            ...prev.discriminatoryQuestions.filter((q) => q.answeredAt),
            ...qs.map((q) => ({ ...q, options: q.options ?? [] })),
          ];
        }

        if (Array.isArray(data.clinicalTests)) {
          const tests = (
            data.clinicalTests as Array<{
              id?: string;
              name: string;
              howToExecute: string;
              positiveResult: string;
              negativeResult: string;
              targetHypotheses: string[];
            }>
          ).map((t) => ({ ...t, id: t.id ?? uuidv4() }));
          // For partials, replace; for final, append to existing
          if (isFinal) {
            updates.clinicalTests = [...prev.clinicalTests, ...tests];
          } else {
            updates.clinicalTests = [
              ...prev.clinicalTests.filter((t) => t.result),
              ...tests,
            ];
          }
        }

        if (
          Array.isArray(data.redFlags) &&
          (data.redFlags as unknown[]).length > 0
        ) {
          const flags = (
            data.redFlags as Array<{
              symptom: string;
              severity: "urgent" | "warning";
              recommendation: string;
            }>
          ).map((rf) => ({
            ...rf,
            id: uuidv4(),
            detectedAt: new Date().toISOString(),
          }));
          updates.redFlags = [...prev.redFlags, ...flags];
        }

        if (
          data.nextPhase === "examination" ||
          (isFinal && Array.isArray(data.clinicalTests) && (data.clinicalTests as unknown[]).length > 0)
        ) {
          updates.phase = "examination";
        }

        if (typeof data.diagnosis === "string") {
          updates.therapyProposal = data as unknown as TherapyProposalType;
          updates.phase = "therapy_proposal";
        }

        return { ...prev, ...updates };
      });
    },
    []
  );

  const handleStreamPartial = useCallback(
    (data: Record<string, unknown>) => applyStreamData(data, false),
    [applyStreamData]
  );

  const handleStreamDone = useCallback(
    (data: Record<string, unknown>) => applyStreamData(data, true),
    [applyStreamData]
  );

  function mergeHypotheses(existing: Hypothesis[], incoming: Hypothesis[]) {
    const merged = [...existing];
    for (const h of incoming) {
      const i = merged.findIndex((e) => e.id === h.id);
      if (i >= 0) merged[i] = { ...merged[i], ...h };
      else merged.push(h);
    }
    return merged;
  }

  // ─── Wizard completion → start session ───
  async function handleWizardComplete(result: WizardResult) {
    const functionalAssessments = result.selectedZones.flatMap((z) =>
      (z.functionalInputs ?? []).map((input, idx) => ({
        id: uuidv4(),
        order: idx + 1,
        jointStructure:
          input.jointStructure as SessionState["functionalAssessments"][number]["jointStructure"],
        movement:
          input.movement as SessionState["functionalAssessments"][number]["movement"],
        provocationType:
          input.provocationType as SessionState["functionalAssessments"][number]["provocationType"],
        mechanicalCondition:
          input.mechanicalCondition as SessionState["functionalAssessments"][number]["mechanicalCondition"],
        romRangeDegrees: input.romRangeDegrees,
        painStartsAtDegrees: input.painStartsAtDegrees,
      }))
    );

    setSession((p) => ({
      ...p,
      selectedZones: result.selectedZones,
      occupationalLoad: result.occupationalLoad,
      activityVolume: result.activityVolume,
      sportProfile: result.sportProfile,
      patientAge: result.patientAge,
      phase: "questioning",
      functionalAssessments,
    }));

    const payload: Record<string, unknown> = {
      selectedZones: result.selectedZones,
      occupationalLoad: result.occupationalLoad,
      activityVolume: result.activityVolume,
      sportProfile: result.sportProfile,
      patientAge: result.patientAge,
      contextId: "default",
    };

    if (functionalAssessments.length > 0) {
      payload.functionalAssessments = functionalAssessments;
    }

    await stream("/api/session/start", payload, handleStreamDone, handleStreamPartial);
  }

  // ─── API: Submit answers batch ───
  async function handleSubmitAnswers() {
    const answers = Object.entries(pendingAnswers).map(
      ([questionId, answer]) => ({ questionId, answer })
    );
    if (answers.length === 0) return;

    const now = new Date().toISOString();
    setSession((prev) => ({
      ...prev,
      discriminatoryQuestions: prev.discriminatoryQuestions.map((q) =>
        pendingAnswers[q.id]
          ? { ...q, answer: pendingAnswers[q.id], answeredAt: now }
          : q
      ),
      history: [
        ...prev.history,
        {
          type: "submit_answers" as const,
          answers,
          notes: questionNotes || undefined,
          timestamp: now,
        },
      ],
    }));

    const sessionForRequest = {
      ...session,
      discriminatoryQuestions: session.discriminatoryQuestions.map((q) =>
        pendingAnswers[q.id]
          ? { ...q, answer: pendingAnswers[q.id], answeredAt: now }
          : q
      ),
    };

    setPendingAnswers({});
    setQuestionNotes("");

    await stream(
      "/api/session/submit-answers",
      {
        sessionState: sessionForRequest,
        answers,
        notes: questionNotes || undefined,
      },
      handleStreamDone,
      handleStreamPartial
    );
  }

  // ─── API: Submit test results batch ───
  async function handleSubmitTestResults() {
    const results = Object.entries(pendingTestResults).map(
      ([testId, result]) => ({ testId, result })
    );
    if (results.length === 0) return;

    const now = new Date().toISOString();
    setSession((prev) => ({
      ...prev,
      clinicalTests: prev.clinicalTests.map((t) =>
        pendingTestResults[t.id]
          ? { ...t, result: pendingTestResults[t.id], executedAt: now }
          : t
      ),
      history: [
        ...prev.history,
        {
          type: "submit_test_results" as const,
          results,
          notes: testNotes || undefined,
          timestamp: now,
        },
      ],
    }));

    const sessionForRequest = {
      ...session,
      clinicalTests: session.clinicalTests.map((t) =>
        pendingTestResults[t.id]
          ? { ...t, result: pendingTestResults[t.id], executedAt: now }
          : t
      ),
    };

    setPendingTestResults({});
    setTestNotes("");

    await stream(
      "/api/session/submit-tests",
      {
        sessionState: sessionForRequest,
        results,
        notes: testNotes || undefined,
      },
      handleStreamDone,
      handleStreamPartial
    );
  }

  // ─── API: Propose therapy ───
  async function proposeTherapy(hypothesisId: string) {
    await stream(
      "/api/session/propose",
      {
        sessionState: session,
        selectedHypothesisId: hypothesisId,
      },
      handleStreamDone,
      handleStreamPartial
    );
  }

  // ─── API: Free input ───
  async function handleFreeInput() {
    if (!freeInput.trim()) return;
    const text = freeInput.trim();
    setFreeInput("");

    const now = new Date().toISOString();
    const newInput = {
      type: "free_input" as const,
      text,
      timestamp: now,
    };

    setSession((p) => ({
      ...p,
      history: [...p.history, newInput],
    }));

    await stream(
      "/api/session/update",
      { sessionState: session, newInput },
      handleStreamDone,
      handleStreamPartial
    );
  }

  // ─── Hypothesis actions ───
  function handleConfirm(id: string) {
    setSession((p) => ({
      ...p,
      hypotheses: p.hypotheses.map((h) =>
        h.id === id
          ? { ...h, confirmedByTest: "Confirmado por el profesional" }
          : h
      ),
    }));
  }

  function handleDiscard(id: string, reason: string) {
    setSession((p) => ({
      ...p,
      hypotheses: p.hypotheses.map((h) =>
        h.id === id ? { ...h, isActive: false, discardedReason: reason } : h
      ),
    }));
  }

  function handleReopen(id: string) {
    setSession((p) => ({
      ...p,
      hypotheses: p.hypotheses.map((h) =>
        h.id === id ? { ...h, isActive: true, discardedReason: undefined } : h
      ),
    }));
  }

  // ─── Feedback ───
  async function handleFeedback(feedback: {
    diagnosticAccuracy: DiagnosticAccuracy;
    utility: Utility;
    difficulty: Difficulty;
    reasoningFailures?: ReasoningFailure[];
    notes?: string;
  }) {
    setFeedbackError(null);
    setIsSavingFeedback(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionState: session, ...feedback }),
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as
          | { error?: string; details?: string }
          | null;

        throw new Error(
          errorBody?.details ?? errorBody?.error ?? "No se pudo guardar feedback"
        );
      }

      window.localStorage.removeItem(SESSION_DRAFT_STORAGE_KEY);
      setSession((p) => ({ ...p, phase: "closed" }));
      setShowFeedback(false);
    } catch (err) {
      console.error("Feedback error:", err);
      setFeedbackError(
        err instanceof Error
          ? err.message
          : "No se pudo guardar el feedback. Revisa la conexion y Supabase."
      );
    } finally {
      setIsSavingFeedback(false);
    }
  }

  function handleNew() {
    abort();
    window.localStorage.removeItem(SESSION_DRAFT_STORAGE_KEY);
    setSession(createEmptySession());
    setFreeInput("");
    setPendingAnswers({});
    setPendingTestResults({});
    setQuestionNotes("");
    setTestNotes("");
    setFeedbackError(null);
    setShowFeedback(false);
  }

  // ─── Render ───
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* ── Header ── */}
      <header className="bg-card/60 border-border/50 flex h-14 shrink-0 items-center justify-between border-b px-6 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold tracking-tight">FisioIA</h1>
          <Badge
            variant="outline"
            className="text-muted-foreground border-border text-[11px] font-normal"
          >
            Fase 0
          </Badge>
        </div>
        <div className="flex items-center gap-1.5">
          {isActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFeedbackError(null);
                setShowFeedback(true);
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              Cerrar sesión
            </Button>
          )}
          <Button
            variant={session.phase === "closed" ? "default" : "ghost"}
            size="sm"
            onClick={handleNew}
          >
            Nuevo caso
          </Button>
          <a href="/log">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              Log
            </Button>
          </a>
          <ThemeToggle />
        </div>
      </header>

      {/* ── Main layout ── */}
      <div className="flex min-h-0 flex-1">
        {isInitial ? (
          <Wizard onStart={handleWizardComplete} />
        ) : (
          /* ══════════════════════════════════════════════
              DIAGNOSTIC VIEW: single column, full width
             ══════════════════════════════════════════════ */
          <div className="flex w-full flex-col animate-[view-enter_400ms_ease-out]">
            <div className="flex-1 overflow-y-auto p-6 lg:p-8">
              <div className="mx-auto flex max-w-3xl flex-col gap-8">
                {/* Patient summary card */}
                <div className="bg-muted/40 rounded-2xl p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {OCCUPATIONAL_LOAD_LABELS[session.occupationalLoad]}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {ACTIVITY_VOLUME_LABELS[session.activityVolume]}
                    </Badge>
                    {session.sportProfile && (
                      <Badge variant="secondary" className="text-xs">
                        {session.sportProfile.sportType}
                      </Badge>
                    )}
                    {session.patientAge && (
                      <Badge variant="secondary" className="text-xs">
                        {session.patientAge} años
                      </Badge>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {session.selectedZones.map((z) => (
                      <span
                        key={z.id}
                        className="bg-primary/10 text-primary inline-flex rounded-full px-3 py-1 text-xs font-medium"
                      >
                        {z.region}
                        {z.side
                          ? ` ${z.side === "left" ? "izq." : "der."}`
                          : ""}{" "}
                        · {z.subzone}
                      </span>
                    ))}
                  </div>
                </div>

                <RedFlagAlert redFlags={session.redFlags} />

                {/* Streaming indicator */}
                {isStreaming && (
                  <div className="bg-primary/5 border-primary/20 flex items-center gap-4 rounded-2xl border px-6 py-5">
                    <Spinner className="text-primary size-5" />
                    <div className="flex flex-col">
                      <span className="text-foreground text-sm font-semibold">
                        {session.phase === "questioning"
                          ? "Analizando caso"
                          : session.phase === "examination"
                            ? "Interpretando exploración"
                            : session.phase === "therapy_proposal"
                              ? "Generando tratamiento"
                              : "Procesando"}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        Procesando datos...
                      </span>
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {!isStreaming &&
                  session.hypotheses.length === 0 &&
                  session.phase !== "closed" && (
                    <div className="text-muted-foreground py-20 text-center text-sm">
                      Las hipótesis aparecerán aquí
                    </div>
                  )}

                <HypothesisTree
                  hypotheses={session.hypotheses}
                  onConfirm={handleConfirm}
                  onDiscard={handleDiscard}
                  onReopen={handleReopen}
                  onSelectForTherapy={proposeTherapy}
                  isProcessing={isStreaming}
                />

                {session.discriminatoryQuestions.length > 0 && (
                  <QuestionPanel
                    questions={session.discriminatoryQuestions}
                    pendingAnswers={pendingAnswers}
                    onSelectAnswer={(qId, answer) =>
                      setPendingAnswers((p) => ({ ...p, [qId]: answer }))
                    }
                    onSubmit={handleSubmitAnswers}
                    notes={questionNotes}
                    onNotesChange={setQuestionNotes}
                    isProcessing={isStreaming}
                  />
                )}

                {session.clinicalTests.length > 0 && (
                  <ClinicalTests
                    tests={session.clinicalTests}
                    pendingResults={pendingTestResults}
                    onSelectResult={(tId, result) =>
                      setPendingTestResults((p) => ({
                        ...p,
                        [tId]: result,
                      }))
                    }
                    onSubmit={handleSubmitTestResults}
                    notes={testNotes}
                    onNotesChange={setTestNotes}
                    isProcessing={isStreaming}
                  />
                )}

                {session.therapyProposal && (
                  <TherapyProposal proposal={session.therapyProposal} />
                )}

                {session.phase === "closed" && (
                  <div className="py-16 text-center">
                    <p className="text-muted-foreground text-base">
                      Sesión cerrada. Feedback guardado.
                    </p>
                    <Button onClick={handleNew} className="mt-6 h-12 px-8">
                      Nuevo caso
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Free input bar — sticky bottom */}
            {isActive && (
              <div className="border-border/50 shrink-0 border-t bg-background p-4">
                <div className="mx-auto flex max-w-3xl gap-3">
                  <Textarea
                    value={freeInput}
                    onChange={(e) => setFreeInput(e.target.value)}
                    placeholder="Info adicional del paciente..."
                    rows={1}
                    className="min-h-12 resize-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleFreeInput();
                      }
                    }}
                  />
                  <Button
                    onClick={handleFreeInput}
                    disabled={!freeInput.trim() || isStreaming}
                    className="h-12 shrink-0 px-6"
                  >
                    Enviar
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Feedback modal */}
      <FeedbackModal
        open={showFeedback}
        onClose={() => setShowFeedback(false)}
        onSubmit={handleFeedback}
        isSubmitting={isSavingFeedback}
        errorMessage={feedbackError}
      />
    </div>
  );
}
