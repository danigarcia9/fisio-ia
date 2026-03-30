import { NextRequest } from "next/server";
import { ProposeTherapyRequestSchema } from "@/lib/schemas/session";
import { proposeDiagnosticTherapy } from "@/lib/ai/agent";
import { createStructuredStreamResponse } from "@/lib/ai/stream";
import type { ClinicContext } from "@/lib/schemas/profile";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = ProposeTherapyRequestSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { sessionState, selectedHypothesisId } = parsed.data;

  const clinicContext: ClinicContext = body.clinicContext ?? {
    id: sessionState.contextId,
    name: "Default",
    techniques: [],
    equipment: [],
  };
  const professionalName: string = body.professionalName ?? "Profesional";

  try {
    const result = proposeDiagnosticTherapy({
      sessionState,
      selectedHypothesisId,
      context: { professionalName, clinicContext },
    });

    return createStructuredStreamResponse(result, "session/propose");
  } catch (err) {
    console.error("Propose therapy error:", err);
    return Response.json(
      { error: "Failed to propose therapy" },
      { status: 500 }
    );
  }
}
