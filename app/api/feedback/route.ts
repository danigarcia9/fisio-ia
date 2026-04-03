import { NextRequest, NextResponse } from "next/server";
import { FeedbackRequestSchema } from "@/lib/schemas/feedback";
import { createServiceClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";

// GET — List feedback entries for the log page
export async function GET() {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("dev_feedback_log")
    .select(
      "id, session_date, patient_zone, patient_profile, patient_age, top_hypothesis, diagnostic_accuracy, utility, difficulty, notes"
    )
    .order("session_date", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch log", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ entries: data });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = FeedbackRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const {
    sessionState,
    diagnosticAccuracy,
    utility,
    difficulty,
    reasoningFailures,
    notes,
  } = parsed.data;

  const supabase = createServiceClient();

  const topHypothesis = sessionState.hypotheses
    .filter((h) => h.isActive)
    .sort((a, b) => b.probability - a.probability)[0];

  const baseInsert = {
    patient_zone: sessionState.selectedZones.map((z) => z.label),
    patient_profile: sessionState.occupationalLoad,
    patient_age: sessionState.patientAge ?? null,
    context_id: sessionState.contextId,
    hypotheses_generated: sessionState.hypotheses as unknown as Json,
    top_hypothesis: topHypothesis
      ? `${topHypothesis.muscle} — ${topHypothesis.condition}`
      : null,
    discriminatory_questions:
      sessionState.discriminatoryQuestions as unknown as Json,
    clinical_tests_suggested:
      sessionState.clinicalTests as unknown as Json,
    therapy_proposed:
      (sessionState.therapyProposal as unknown as Json) ?? null,
    diagnostic_accuracy: diagnosticAccuracy,
    utility,
    difficulty,
    notes: notes ?? null,
    raw_session_state: sessionState as unknown as Json,
  };

  let { error } = await supabase.from("dev_feedback_log").insert({
    ...baseInsert,
    reasoning_failures: reasoningFailures ?? null,
  });

  // Backward-compatible fallback for environments that have not applied
  // migration 002 yet (missing reasoning_failures column).
  if (error?.message.includes("reasoning_failures")) {
    ({ error } = await supabase.from("dev_feedback_log").insert(baseInsert));
  }

  if (error) {
    return NextResponse.json(
      { error: "Failed to save feedback", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
