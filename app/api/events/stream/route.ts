import { NextRequest, NextResponse } from "next/server";
import { addClient, removeClient } from "./sse-utils";


/**
 * SSE Stream Endpoint
 * GET /api/events/stream
 *
 * Establishes Server-Sent Events connection for real-time updates
 */
export async function GET(request: NextRequest) {
  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Add client to active connections
      const writer = {
        write: (chunk: Uint8Array) => {
          try {
            controller.enqueue(chunk);
          } catch (error) {
            console.error("[SSE] Error writing to stream:", error);
          }
        },
        closed: Promise.resolve(),
        close: () => {
          try {
            controller.close();
          } catch (error) {
            // Stream already closed
          }
        },
      } as WritableStreamDefaultWriter<Uint8Array>;

      addClient(writer);

      // Send initial connection event
      try {
        writer.write(encoder.encode(`event: connected\ndata: {"status":"ok","timestamp":"${new Date().toISOString()}"}\n\n`));
      } catch (error) {
        console.error("[SSE] Error sending connection event:", error);
      }

      // Keep-alive ping every 15 seconds
      const pingInterval = setInterval(() => {
        try {
          writer.write(encoder.encode(`event: ping\ndata: {"timestamp":"${new Date().toISOString()}"}\n\n`));
        } catch (error) {
          console.error("[SSE] Error sending ping:", error);
          clearInterval(pingInterval);
          removeClient(writer);
        }
      }, 15000);

      // Cleanup on connection close
      request.signal.addEventListener("abort", () => {
        clearInterval(pingInterval);
        removeClient(writer);
        writer.close();
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering
    },
  });
}

