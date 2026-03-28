import { NextRequest } from "next/server";
import { UpdateSessionRequestSchema } from "@/lib/schemas/session";
import { updateDiagnosticSession } from "@/lib/ai/agent";
import type { ClinicContext } from "@/lib/schemas/profile";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = UpdateSessionRequestSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { sessionState, newInput } = parsed.data;

  const clinicContext: ClinicContext = body.clinicContext ?? {
    id: sessionState.contextId,
    name: "Default",
    techniques: [],
    equipment: [],
  };
  const professionalName: string = body.professionalName ?? "Profesional";

  // Build a human-readable description of the new input for the agent
  let inputDescription: string;
  switch (newInput.type) {
    case "question_answered": {
      const question = sessionState.discriminatoryQuestions.find(
        (q) => q.id === newInput.questionId
      );
      inputDescription = `Respuesta a pregunta "${question?.text ?? newInput.questionId}": ${newInput.answer}`;
      break;
    }
    case "test_result": {
      const test = sessionState.clinicalTests.find(
        (t) => t.id === newInput.testId
      );
      inputDescription = `Resultado del test "${test?.name ?? newInput.testId}": ${newInput.result}`;
      break;
    }
    case "free_input":
      inputDescription = newInput.text;
      break;
    case "hypothesis_confirmed":
      inputDescription = `El profesional ha confirmado la hipótesis ${newInput.hypothesisId}`;
      break;
    case "hypothesis_discarded":
      inputDescription = `El profesional ha descartado la hipótesis ${newInput.hypothesisId}: ${newInput.reason}`;
      break;
    case "hypothesis_reopened":
      inputDescription = `El profesional quiere reconsiderar la hipótesis ${newInput.hypothesisId}`;
      break;
    case "treatment_failed":
      inputDescription = `Un tratamiento previo no funcionó: ${newInput.description}`;
      break;
  }

  try {
    const result = updateDiagnosticSession({
      sessionState,
      newInput: inputDescription,
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

    console.log("[session/update]", toolItems.length, "tool items:", toolItems.map(t => t.toolName));

    return Response.json({ text, toolItems });
  } catch (err) {
    console.error("Update session error:", err);
    return Response.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}
