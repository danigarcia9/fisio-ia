import { NextRequest } from "next/server";
import { StartSessionRequestSchema } from "@/lib/schemas/session";
import { startDiagnosticSession } from "@/lib/ai/agent";
import type { ClinicContext } from "@/lib/schemas/profile";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = StartSessionRequestSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { selectedZones, patientProfile, patientAge, patientHabits, contextId } = parsed.data;

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
      patientProfile,
      patientAge,
      patientHabits,
      context: {
        professionalName,
        clinicContext,
      },
    });

    const [text, toolCalls, toolResults, steps] = await Promise.all([
      result.text,
      result.toolCalls,
      result.toolResults,
      result.steps,
    ]);

    // Build response with normalized tool items for robust client parsing
    const toolItems: Array<{ toolName: string; result: Record<string, unknown> }> = [];

    for (const step of steps) {
      if (step.toolResults) {
        for (const tr of step.toolResults) {
          const obj = tr as unknown as Record<string, unknown>;
          const toolName = obj.toolName as string;
          const result = (obj.result ?? obj.output ?? obj.input) as Record<string, unknown>;
          if (toolName && result) {
            toolItems.push({ toolName, result });
          }
        }
      }
    }

    console.log("[session/start]", toolItems.length, "tool items:", toolItems.map(t => t.toolName));

    return Response.json({ text, toolItems });
  } catch (err) {
    console.error("Start session error:", err);
    return Response.json(
      { error: "Failed to start session" },
      { status: 500 }
    );
  }
}
