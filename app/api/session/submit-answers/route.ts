import { NextRequest } from "next/server";
import { SubmitAnswersRequestSchema } from "@/lib/schemas/session";
import { submitAnswersSession } from "@/lib/ai/agent";
import { createStructuredStreamResponse } from "@/lib/ai/stream";
import type { ClinicContext } from "@/lib/schemas/profile";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = SubmitAnswersRequestSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { sessionState, answers, notes } = parsed.data;

  const clinicContext: ClinicContext = body.clinicContext ?? {
    id: sessionState.contextId,
    name: "Default",
    techniques: [],
    equipment: [],
  };
  const professionalName: string = body.professionalName ?? "Profesional";

  try {
    const result = submitAnswersSession({
      sessionState,
      answers,
      notes,
      context: { professionalName, clinicContext },
    });

    return createStructuredStreamResponse(result, "session/submit-answers");
  } catch (err) {
    console.error("Submit answers error:", err);
    return Response.json(
      { error: "Failed to submit answers" },
      { status: 500 }
    );
  }
}
