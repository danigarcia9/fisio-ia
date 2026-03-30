"use client";

import { useState, useRef, useCallback } from "react";

type PartialHandler = (data: Record<string, unknown>) => void;
type DoneHandler = (data: Record<string, unknown>) => void;

/**
 * Custom hook for consuming SSE structured streams from the session API.
 * Parses the structured SSE protocol (partial, done, error events).
 *
 * Exposes:
 * - isStreaming: whether a stream is in progress
 * - stream(url, body, onDone, onPartial?): start a stream
 * - abort(): cancel the current stream
 */
export function useSessionStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const stream = useCallback(
    async (
      url: string,
      body: unknown,
      onDone: DoneHandler,
      onPartial?: PartialHandler
    ) => {
      setIsStreaming(true);
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: ctrl.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(`Stream failed: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process complete SSE events (delimited by \n\n)
          const events = buffer.split("\n\n");
          buffer = events.pop() ?? "";

          for (const event of events) {
            const dataLine = event.trim();
            if (!dataLine.startsWith("data: ")) continue;

            try {
              const data = JSON.parse(dataLine.slice(6));

              if (data.type === "partial" && onPartial) {
                onPartial(data.data);
              }

              if (data.type === "done") {
                onDone(data.data);
              }

              if (data.type === "error") {
                console.error("Stream error from server:", data.message);
              }
            } catch {
              // Skip malformed events
            }
          }
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error("Stream error:", err);
      } finally {
        setIsStreaming(false);
      }
    },
    []
  );

  const abort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { isStreaming, stream, abort };
}
