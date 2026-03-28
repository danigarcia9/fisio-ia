"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ZoneSelector } from "@/components/session/ZoneSelector";
import { HypothesisTree } from "@/components/session/HypothesisTree";
import { QuestionPanel } from "@/components/session/QuestionPanel";
import { ClinicalTests } from "@/components/session/ClinicalTests";
import { RedFlagAlert } from "@/components/session/RedFlagAlert";
import { TherapyProposal } from "@/components/session/TherapyProposal";
import { FeedbackModal } from "@/components/session/FeedbackModal";
import type {
  SessionState,
  SelectedZone,
  PatientProfile,
  Hypothesis,
  RedFlag,
  TherapyProposal as TherapyProposalType,
} from "@/lib/schemas/session";
import type {
  DiagnosticAccuracy,
  Utility,
  Difficulty,
} from "@/lib/schemas/feedback";
import { patientProfiles } from "@/lib/schemas/session";
import { ThemeToggle } from "@/components/theme-toggle";

const profileLabels: Record<PatientProfile, string> = {
  sedentary: "Sedentario",
  amateur_athlete: "Deportista amateur",
  elite_athlete: "Alto rendimiento",
  physical_work: "Trabajo físico",
};

const COMMON_HABITS = [
  "Corredor", "Ciclista", "Nadador", "Crossfit", "Gimnasio",
  "Fútbol", "Pádel/Tenis", "Yoga/Pilates",
  "Oficina", "Trabajo manual", "Conductor", "De pie mucho",
  "Fumador", "Estrés alto", "Duerme poco", "Sueño irregular",
];

function createEmptySession(): SessionState {
  return {
    id: uuidv4(),
    startedAt: new Date().toISOString(),
    selectedZones: [],
    patientProfile: "sedentary",
    patientAge: undefined,
    patientHabits: [],
    contextId: "default",
    history: [],
    hypotheses: [],
    discriminatoryQuestions: [],
    clinicalTests: [],
    redFlags: [],
    therapyProposal: undefined,
    phase: "initial",
  };
}

// ─── Draggable resize hook ───
function useResizable(initialWidth: number, min: number, max: number) {
  const [width, setWidth] = useState(initialWidth);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startW = useRef(0);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      isDragging.current = true;
      startX.current = e.clientX;
      startW.current = width;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [width]
  );

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!isDragging.current) return;
      const delta = e.clientX - startX.current;
      const next = Math.max(min, Math.min(max, startW.current + delta));
      setWidth(next);
    }
    function onMouseUp() {
      if (!isDragging.current) return;
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [min, max]);

  return { width, onMouseDown };
}

// ─── Main page ───
export default function SessionPage() {
  const [session, setSession] = useState<SessionState>(createEmptySession);
  const [isProcessing, setIsProcessing] = useState(false);
  const [freeInput, setFreeInput] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSavingFeedback, setIsSavingFeedback] = useState(false);
  const [customHabit, setCustomHabit] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const { width: leftW, onMouseDown: onDragStart } = useResizable(440, 320, 600);

  const isActive =
    session.phase !== "initial" && session.phase !== "closed";

  // ─── Zone handlers ───
  const handleZoneAdded = useCallback((zone: SelectedZone) => {
    setSession((prev) => ({
      ...prev,
      selectedZones: [...prev.selectedZones, zone],
    }));
  }, []);

  const handleZoneRemoved = useCallback((zoneId: string) => {
    setSession((prev) => ({
      ...prev,
      selectedZones: prev.selectedZones.filter((z) => z.id !== zoneId),
    }));
  }, []);

  // ─── Habit handlers ───
  function toggleHabit(habit: string) {
    setSession((prev) => ({
      ...prev,
      patientHabits: (prev.patientHabits ?? []).includes(habit)
        ? (prev.patientHabits ?? []).filter((h) => h !== habit)
        : [...(prev.patientHabits ?? []), habit],
    }));
  }

  function addCustomHabit() {
    if (!customHabit.trim()) return;
    const h = customHabit.trim();
    if (!(session.patientHabits ?? []).includes(h)) {
      toggleHabit(h);
    }
    setCustomHabit("");
  }

  // ─── API calls ───
  async function startSession() {
    if (session.selectedZones.length === 0) return;
    setIsProcessing(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const res = await fetch("/api/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedZones: session.selectedZones,
          patientProfile: session.patientProfile,
          patientAge: session.patientAge,
          patientHabits: session.patientHabits,
          contextId: session.contextId,
        }),
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error("Failed");
      processAgentResponse(await res.json());
      setSession((p) => ({ ...p, phase: "questioning" }));
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      console.error("Start session error:", err);
    } finally {
      setIsProcessing(false);
    }
  }

  async function updateSession(newInput: SessionState["history"][number]) {
    setIsProcessing(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const updated = { ...session, history: [...session.history, newInput] };
    setSession(updated);
    try {
      const res = await fetch("/api/session/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionState: updated, newInput }),
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error("Failed");
      processAgentResponse(await res.json());
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      console.error("Update session error:", err);
    } finally {
      setIsProcessing(false);
    }
  }

  async function proposeTherapy(hypothesisId: string) {
    setIsProcessing(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const res = await fetch("/api/session/propose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionState: session,
          selectedHypothesisId: hypothesisId,
        }),
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error("Failed");
      processAgentResponse(await res.json());
      setSession((p) => ({ ...p, phase: "therapy_proposal" }));
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      console.error("Propose therapy error:", err);
    } finally {
      setIsProcessing(false);
    }
  }

  // ─── Process AI response ───
  function processAgentResponse(data: {
    toolItems?: Array<{ toolName: string; result: Record<string, unknown> }>;
  }) {
    const all = data.toolItems ?? [];
    console.log("[FisioIA]", all.length, "tool items:", all.map((a) => a.toolName));

    for (const { toolName, result } of all) {
      if (toolName === "updateHypotheses" && result) {
        const hyps = (
          result.hypotheses as Array<{
            id: string;
            muscle: string;
            condition: string;
            probability: number;
            justification: string;
          }>
        ).map((h) => ({ ...h, isActive: true }));

        const qs = (
          result.discriminatoryQuestions as Array<{
            id: string;
            text: string;
            discriminatoryPower: "high" | "medium" | "low";
            targetHypotheses: string[];
          }>
        ).map((q) => ({ ...q }));

        const tests = (
          (result.clinicalTestsSuggested as Array<{
            name: string;
            howToExecute: string;
            positiveResult: string;
            negativeResult: string;
            targetHypotheses: string[];
          }>) ?? []
        ).map((t) => ({ ...t, id: uuidv4() }));

        setSession((prev) => ({
          ...prev,
          hypotheses: mergeHypotheses(prev.hypotheses, hyps),
          discriminatoryQuestions: [
            ...prev.discriminatoryQuestions.filter((q) => q.answer),
            ...qs,
          ],
          clinicalTests: [...prev.clinicalTests, ...tests],
          phase:
            tests.length > 0 && prev.phase === "questioning"
              ? "examination"
              : prev.phase,
        }));
      }
      if (toolName === "flagRedFlag" && result) {
        const flag: RedFlag = {
          id: uuidv4(),
          symptom: result.symptom as string,
          severity: result.severity as "urgent" | "warning",
          recommendation: result.recommendation as string,
          detectedAt: new Date().toISOString(),
        };
        setSession((p) => ({ ...p, redFlags: [...p.redFlags, flag] }));
      }
      if (toolName === "proposeTherapy" && result) {
        setSession((p) => ({
          ...p,
          therapyProposal: result as unknown as TherapyProposalType,
        }));
      }
    }
  }

  function mergeHypotheses(existing: Hypothesis[], incoming: Hypothesis[]) {
    const merged = [...existing];
    for (const h of incoming) {
      const i = merged.findIndex((e) => e.id === h.id);
      if (i >= 0) merged[i] = { ...merged[i], ...h };
      else merged.push(h);
    }
    return merged;
  }

  // ─── Event handlers ───
  function handleAnswer(qId: string, answer: "yes" | "no" | "unclear") {
    setSession((p) => ({
      ...p,
      discriminatoryQuestions: p.discriminatoryQuestions.map((q) =>
        q.id === qId
          ? { ...q, answer, answeredAt: new Date().toISOString() }
          : q
      ),
    }));
    updateSession({
      type: "question_answered",
      questionId: qId,
      answer,
      timestamp: new Date().toISOString(),
    });
  }

  function handleTestResult(
    tId: string,
    result: "positive" | "negative" | "inconclusive"
  ) {
    setSession((p) => ({
      ...p,
      clinicalTests: p.clinicalTests.map((t) =>
        t.id === tId
          ? { ...t, result, executedAt: new Date().toISOString() }
          : t
      ),
    }));
    updateSession({
      type: "test_result",
      testId: tId,
      result,
      timestamp: new Date().toISOString(),
    });
  }

  function handleFreeInput() {
    if (!freeInput.trim()) return;
    updateSession({
      type: "free_input",
      text: freeInput.trim(),
      timestamp: new Date().toISOString(),
    });
    setFreeInput("");
  }

  function handleConfirm(id: string) {
    setSession((p) => ({
      ...p,
      hypotheses: p.hypotheses.map((h) =>
        h.id === id
          ? { ...h, confirmedByTest: "Confirmado por el profesional" }
          : h
      ),
    }));
    updateSession({
      type: "hypothesis_confirmed",
      hypothesisId: id,
      timestamp: new Date().toISOString(),
    });
  }

  function handleDiscard(id: string, reason: string) {
    setSession((p) => ({
      ...p,
      hypotheses: p.hypotheses.map((h) =>
        h.id === id ? { ...h, isActive: false, discardedReason: reason } : h
      ),
    }));
    updateSession({
      type: "hypothesis_discarded",
      hypothesisId: id,
      reason,
      timestamp: new Date().toISOString(),
    });
  }

  function handleReopen(id: string) {
    setSession((p) => ({
      ...p,
      hypotheses: p.hypotheses.map((h) =>
        h.id === id ? { ...h, isActive: true, discardedReason: undefined } : h
      ),
    }));
    updateSession({
      type: "hypothesis_reopened",
      hypothesisId: id,
      timestamp: new Date().toISOString(),
    });
  }

  async function handleFeedback(feedback: {
    diagnosticAccuracy: DiagnosticAccuracy;
    utility: Utility;
    difficulty: Difficulty;
    notes?: string;
  }) {
    setIsSavingFeedback(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionState: session, ...feedback }),
      });
      setSession((p) => ({ ...p, phase: "closed" }));
      setShowFeedback(false);
    } catch (err) {
      console.error("Feedback error:", err);
    } finally {
      setIsSavingFeedback(false);
    }
  }

  function handleNew() {
    abortRef.current?.abort();
    setSession(createEmptySession());
    setFreeInput("");
    setCustomHabit("");
    setShowFeedback(false);
  }

  const isInitial = session.phase === "initial";

  // ─── Shared form pieces ───

  const patientDataBlock = (
    <>
      {/* Profile + age row */}
      <div className="flex items-end gap-3">
        <div className="flex flex-1 flex-col gap-1.5">
          <label className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
            Perfil
          </label>
          <Select
            value={session.patientProfile}
            onValueChange={(v) =>
              setSession((p) => ({
                ...p,
                patientProfile: v as PatientProfile,
              }))
            }
            disabled={isActive}
          >
            <SelectTrigger className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {patientProfiles.map((p) => (
                <SelectItem key={p} value={p}>
                  {profileLabels[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-20 flex-col gap-1.5">
          <label className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
            Edad
          </label>
          <input
            type="number"
            min={0}
            max={120}
            placeholder="—"
            value={session.patientAge ?? ""}
            onChange={(e) =>
              setSession((p) => ({
                ...p,
                patientAge: e.target.value
                  ? parseInt(e.target.value)
                  : undefined,
              }))
            }
            disabled={isActive}
            className="bg-card border-border h-11 rounded-lg border px-3 tabular-nums transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Hábitos y actividad */}
      <div className="flex flex-col gap-2">
        <label className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
          Hábitos y actividad
        </label>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_HABITS.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => toggleHabit(h)}
              disabled={isActive}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium transition-all active:scale-[0.97]",
                (session.patientHabits ?? []).includes(h)
                  ? "bg-teal-500/20 border border-teal-500/50 text-teal-700 dark:text-teal-200"
                  : "bg-muted border border-transparent text-muted-foreground hover:bg-teal-500/10 hover:text-foreground"
              )}
            >
              {h}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={customHabit}
            onChange={(e) => setCustomHabit(e.target.value)}
            placeholder="Otro hábito..."
            disabled={isActive}
            className="bg-card border-border h-9 flex-1 rounded-lg border px-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            onKeyDown={(e) => {
              if (e.key === "Enter" && customHabit.trim()) addCustomHabit();
            }}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={addCustomHabit}
            disabled={!customHabit.trim() || isActive}
            className="h-9 shrink-0"
          >
            +
          </Button>
        </div>
      </div>
    </>
  );

  const zoneSelectorBlock = (
    <ZoneSelector
      selectedZones={session.selectedZones}
      onZoneAdded={handleZoneAdded}
      onZoneRemoved={handleZoneRemoved}
      disabled={isActive}
    />
  );

  const freeInputBlock = isActive && (
    <div className="flex flex-col gap-2">
      <Separator className="opacity-50" />
      <label className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
        Info adicional
      </label>
      <div className="flex gap-2">
        <Textarea
          value={freeInput}
          onChange={(e) => setFreeInput(e.target.value)}
          placeholder="Escribe información del paciente..."
          rows={2}
          className="resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleFreeInput();
            }
          }}
        />
        <Button
          onClick={handleFreeInput}
          disabled={!freeInput.trim() || isProcessing}
          size="sm"
          className="h-auto self-end"
        >
          Enviar
        </Button>
      </div>
    </div>
  );

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
              onClick={() => setShowFeedback(true)}
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
        {/* ══════════════════════════════════════════════
            INITIAL: full-width two-column layout
           ══════════════════════════════════════════════ */}
        {isInitial ? (
          <div className="flex w-full flex-col">
            <div className="flex-1 overflow-y-auto p-6 lg:p-10">
              <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2 lg:gap-12">
                {/* Left col: patient data */}
                <div className="flex flex-col gap-5">
                  <h2 className="text-foreground text-base font-semibold tracking-tight">
                    Datos del paciente
                  </h2>
                  {patientDataBlock}
                </div>

                {/* Right col: zone selector */}
                <div className="flex flex-col gap-5">
                  <h2 className="text-foreground text-base font-semibold tracking-tight">
                    Zona de dolor
                  </h2>
                  {zoneSelectorBlock}
                </div>
              </div>
            </div>

            {/* Sticky CTA */}
            <div className="border-border/50 shrink-0 border-t p-4">
              <div className="mx-auto max-w-5xl">
                <Button
                  onClick={startSession}
                  disabled={session.selectedZones.length === 0 || isProcessing}
                  className="h-12 w-full text-[15px] font-semibold"
                >
                  {isProcessing
                    ? "Generando hipótesis..."
                    : "Iniciar diagnóstico"}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* ══════════════════════════════════════════════
              ACTIVE / CLOSED: sidebar + results
             ══════════════════════════════════════════════ */
          <>
            {/* ── LEFT sidebar ── */}
            <div
              className="flex shrink-0 flex-col animate-[sidebar-collapse_500ms_ease-in-out]"
              style={{ width: leftW }}
            >
              <div className="flex-1 overflow-y-auto p-6">
                <div className="flex flex-col gap-5">
                  {patientDataBlock}
                  {zoneSelectorBlock}
                  {freeInputBlock}
                </div>
              </div>
            </div>

            {/* ── Resize handle ── */}
            <div
              className="group relative z-10 flex w-1.5 shrink-0 cursor-col-resize items-center justify-center"
              onMouseDown={onDragStart}
            >
              <div className="bg-border group-hover:bg-primary/40 h-full w-px transition-colors" />
              <div className="bg-border group-hover:bg-primary/60 absolute h-8 w-1 rounded-full transition-colors" />
            </div>

            {/* ── RIGHT: Diagnostic results ── */}
            <div className="flex min-w-0 flex-1 flex-col animate-[results-enter_500ms_ease-in-out]">
              <div className="flex-1 overflow-y-auto p-6">
                <div className="mx-auto flex max-w-2xl flex-col gap-6">
                  <RedFlagAlert redFlags={session.redFlags} />

                  <HypothesisTree
                    hypotheses={session.hypotheses}
                    onConfirm={handleConfirm}
                    onDiscard={handleDiscard}
                    onReopen={handleReopen}
                    onSelectForTherapy={proposeTherapy}
                    isProcessing={isProcessing}
                  />

                  {session.discriminatoryQuestions.length > 0 && (
                    <>
                      <Separator className="opacity-30" />
                      <QuestionPanel
                        questions={session.discriminatoryQuestions}
                        onAnswer={handleAnswer}
                        isProcessing={isProcessing}
                      />
                    </>
                  )}

                  {session.clinicalTests.length > 0 && (
                    <>
                      <Separator className="opacity-30" />
                      <ClinicalTests
                        tests={session.clinicalTests}
                        onResult={handleTestResult}
                        isProcessing={isProcessing}
                      />
                    </>
                  )}

                  {session.therapyProposal && (
                    <>
                      <Separator className="opacity-30" />
                      <TherapyProposal proposal={session.therapyProposal} />
                    </>
                  )}

                  {session.phase === "closed" && (
                    <div className="py-12 text-center">
                      <p className="text-muted-foreground">
                        Sesión cerrada. Feedback guardado.
                      </p>
                      <Button onClick={handleNew} className="mt-4">
                        Nuevo caso
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Feedback modal */}
      <FeedbackModal
        open={showFeedback}
        onClose={() => setShowFeedback(false)}
        onSubmit={handleFeedback}
        isSubmitting={isSavingFeedback}
      />
    </div>
  );
}
