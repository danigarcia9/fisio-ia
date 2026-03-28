import { NextRequest } from "next/server";
import { ProposeTherapyRequestSchema } from "@/lib/schemas/session";
import { proposeDiagnosticTherapy } from "@/lib/ai/agent";
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

    console.log("[session/propose]", toolItems.length, "tool items:", toolItems.map(t => t.toolName));

    return Response.json({ text, toolItems });
  } catch (err) {
    console.error("Propose therapy error:", err);
    return Response.json(
      { error: "Failed to propose therapy" },
      { status: 500 }
    );
  }
}
