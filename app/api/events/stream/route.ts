import { NextRequest, NextResponse } from "next/server";

/**
 * Connected SSE clients
 * Each client has a writer to send events
 */
const clients = new Set<WritableStreamDefaultWriter<Uint8Array>>();

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

      clients.add(writer);

      console.log(`[SSE] Client connected. Total clients: ${clients.size}`);

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
          clients.delete(writer);
        }
      }, 15000);

      // Cleanup on connection close
      request.signal.addEventListener("abort", () => {
        clearInterval(pingInterval);
        clients.delete(writer);
        writer.close();
        console.log(`[SSE] Client disconnected. Total clients: ${clients.size}`);
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

/**
 * Broadcast an event to all connected SSE clients
 *
 * @param event - Event type (e.g., "new_message", "customer_created")
 * @param data - Event data (will be JSON stringified)
 */
export function broadcastEvent(event: string, data: any): void {
  const encoder = new TextEncoder();
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  const encodedPayload = encoder.encode(payload);

  console.log(`[SSE] Broadcasting event: ${event} to ${clients.size} clients`);

  let failedClients = 0;

  for (const writer of clients) {
    try {
      writer.write(encodedPayload);
    } catch (error) {
      console.error(`[SSE] Failed to send to client:`, error);
      clients.delete(writer);
      failedClients++;
    }
  }

  if (failedClients > 0) {
    console.log(`[SSE] Removed ${failedClients} failed clients. Remaining: ${clients.size}`);
  }
}

/**
 * Get the number of connected SSE clients
 */
export function getConnectedClientsCount(): number {
  return clients.size;
}

/**
 * Disconnect all SSE clients (for testing or shutdown)
 */
export function disconnectAllClients(): void {
  console.log(`[SSE] Disconnecting all ${clients.size} clients`);

  for (const writer of clients) {
    try {
      writer.close();
    } catch (error) {
      // Ignore errors during shutdown
    }
  }

  clients.clear();
}
