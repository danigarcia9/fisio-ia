import type { StreamTextResult } from "ai";

const THROTTLE_MS = 150;

/**
 * Converts a streamText result (with output schema) into an SSE Response
 * that streams partial structured objects to the client in real-time.
 *
 * Protocol:
 * - data: {"type":"partial","data":{...partial object...}}
 * - data: {"type":"done","data":{...final object...},"duration":1234}
 * - data: {"type":"error","message":"..."}
 */
export function createStructuredStreamResponse(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  streamResult: StreamTextResult<any, any>,
  label: string
): Response {
  const encoder = new TextEncoder();
  const t0 = Date.now();

  console.log(`[${label}] Stream started`);

  const stream = new ReadableStream({
    async start(controller) {
      try {
        let lastSend = 0;

        for await (const partial of streamResult.partialOutputStream) {
          const now = Date.now();
          if (now - lastSend >= THROTTLE_MS) {
            const event = JSON.stringify({ type: "partial", data: partial });
            controller.enqueue(encoder.encode(`data: ${event}\n\n`));
            lastSend = now;
          }
        }

        // Send the final validated object
        const finalObject = await streamResult.output;
        const duration = Date.now() - t0;
        console.log(`[${label}] Stream complete: ${duration}ms`);

        const doneEvent = JSON.stringify({
          type: "done",
          data: finalObject,
          duration,
        });
        controller.enqueue(encoder.encode(`data: ${doneEvent}\n\n`));
      } catch (err) {
        const duration = Date.now() - t0;
        console.error(
          `[${label}] Stream error after ${duration}ms:`,
          err instanceof Error ? err.message : err
        );
        const event = JSON.stringify({
          type: "error",
          message: err instanceof Error ? err.message : String(err),
        });
        controller.enqueue(encoder.encode(`data: ${event}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
