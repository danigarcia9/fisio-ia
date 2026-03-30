import { NextRequest } from "next/server";
import { SubmitTestResultsRequestSchema } from "@/lib/schemas/session";
import { submitTestResultsSession } from "@/lib/ai/agent";
import { createStructuredStreamResponse } from "@/lib/ai/stream";
import type { ClinicContext } from "@/lib/schemas/profile";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = SubmitTestResultsRequestSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { sessionState, results, notes } = parsed.data;

  const clinicContext: ClinicContext = body.clinicContext ?? {
    id: sessionState.contextId,
    name: "Default",
    techniques: [],
    equipment: [],
  };
  const professionalName: string = body.professionalName ?? "Profesional";

  try {
    const result = submitTestResultsSession({
      sessionState,
      results,
      notes,
      context: { professionalName, clinicContext },
    });

    return createStructuredStreamResponse(result, "session/submit-tests");
  } catch (err) {
    console.error("Submit test results error:", err);
    return Response.json(
      { error: "Failed to submit test results" },
      { status: 500 }
    );
  }
}
