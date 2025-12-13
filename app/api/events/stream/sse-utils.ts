/**
 * SSE (Server-Sent Events) Utilities
 * Manages client connections and event broadcasting
 */

/**
 * Connected SSE clients
 * Each client has a writer to send events
 */
const clients = new Set<WritableStreamDefaultWriter<Uint8Array>>();

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

/**
 * Add a client to the active connections
 */
export function addClient(writer: WritableStreamDefaultWriter<Uint8Array>): void {
    clients.add(writer);
    console.log(`[SSE] Client connected. Total clients: ${clients.size}`);
}

/**
 * Remove a client from active connections
 */
export function removeClient(writer: WritableStreamDefaultWriter<Uint8Array>): void {
    clients.delete(writer);
    console.log(`[SSE] Client disconnected. Total clients: ${clients.size}`);
}
