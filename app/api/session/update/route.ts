import { NextRequest } from "next/server";
import { UpdateSessionRequestSchema } from "@/lib/schemas/session";
import { updateDiagnosticSession } from "@/lib/ai/agent";
import { createStructuredStreamResponse } from "@/lib/ai/stream";
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
    case "submit_answers": {
      const answers = newInput.answers
        .map((a) => {
          const q = sessionState.discriminatoryQuestions.find(
            (q) => q.id === a.questionId
          );
          return `- "${q?.text ?? a.questionId}": ${a.answer}`;
        })
        .join("\n");
      inputDescription = `Respuestas en lote:\n${answers}${newInput.notes ? `\nNotas: ${newInput.notes}` : ""}`;
      break;
    }
    case "submit_test_results": {
      const results = newInput.results
        .map((r) => {
          const t = sessionState.clinicalTests.find(
            (t) => t.id === r.testId
          );
          return `- "${t?.name ?? r.testId}": ${r.result}`;
        })
        .join("\n");
      inputDescription = `Resultados de tests en lote:\n${results}${newInput.notes ? `\nNotas: ${newInput.notes}` : ""}`;
      break;
    }
  }

  try {
    const result = updateDiagnosticSession({
      sessionState,
      newInput: inputDescription,
      context: { professionalName, clinicContext },
    });

    return createStructuredStreamResponse(result, "session/update");
  } catch (err) {
    console.error("Update session error:", err);
    return Response.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}
