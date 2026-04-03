import { NextRequest } from "next/server";
import { StartSessionRequestSchema } from "@/lib/schemas/session";
import { startDiagnosticSession } from "@/lib/ai/agent";
import { createStructuredStreamResponse } from "@/lib/ai/stream";
import type { ClinicContext } from "@/lib/schemas/profile";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = StartSessionRequestSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const {
    selectedZones,
    occupationalLoad,
    activityVolume,
    sportProfile,
    patientAge,
    contextId,
    functionalAssessments,
  } = parsed.data;

  const clinicContext: ClinicContext = body.clinicContext ?? {
    id: contextId,
    name: "Default",
    techniques: [],
    equipment: [],
  };

  const professionalName: string = body.professionalName ?? "Profesional";

  try {
    const result = startDiagnosticSession({
      selectedZones,
      occupationalLoad,
      activityVolume,
      sportProfile,
      patientAge,
      functionalAssessments,
      context: { professionalName, clinicContext },
    });

    return createStructuredStreamResponse(result, "session/start");
  } catch (err) {
    console.error("Start session error:", err);
    return Response.json(
      { error: "Failed to start session" },
      { status: 500 }
    );
  }
}
