"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Event handler type for SSE events
 */
export type SSEEventHandler = (data: any) => void;

/**
 * Configuration options for useSSEConnection hook
 */
export interface UseSSEConnectionOptions {
  /**
   * URL of the SSE endpoint
   * @default "/api/events/stream"
   */
  url?: string;

  /**
   * Whether to automatically connect on mount
   * @default true
   */
  autoConnect?: boolean;

  /**
   * Whether to automatically reconnect on connection loss
   * @default true
   */
  autoReconnect?: boolean;

  /**
   * Maximum number of reconnection attempts
   * @default 5
   */
  maxReconnectAttempts?: number;

  /**
   * Initial reconnection delay in milliseconds
   * @default 1000
   */
  reconnectDelay?: number;

  /**
   * Maximum reconnection delay in milliseconds (for exponential backoff)
   * @default 30000 (30 seconds)
   */
  maxReconnectDelay?: number;

  /**
   * Event handlers for specific event types
   */
  onEvent?: {
    [eventType: string]: SSEEventHandler;
  };

  /**
   * Callback when connection is established
   */
  onConnect?: () => void;

  /**
   * Callback when connection is lost
   */
  onDisconnect?: (event: Event) => void;

  /**
   * Callback when an error occurs
   */
  onError?: (error: Event) => void;
}

/**
 * Return type for useSSEConnection hook
 */
export interface UseSSEConnectionReturn {
  /**
   * Whether the connection is currently active
   */
  isConnected: boolean;

  /**
   * Whether the connection is currently attempting to reconnect
   */
  isReconnecting: boolean;

  /**
   * Current reconnection attempt number (0 if not reconnecting)
   */
  reconnectAttempt: number;

  /**
   * The last error that occurred
   */
  error: Event | null;

  /**
   * Manually connect to the SSE stream
   */
  connect: () => void;

  /**
   * Manually disconnect from the SSE stream
   */
  disconnect: () => void;

  /**
   * Add an event listener for a specific event type
   */
  addEventListener: (eventType: string, handler: SSEEventHandler) => void;

  /**
   * Remove an event listener for a specific event type
   */
  removeEventListener: (eventType: string, handler: SSEEventHandler) => void;
}

/**
 * React hook for managing Server-Sent Events (SSE) connections
 *
 * Features:
 * - Automatic connection management
 * - Automatic reconnection with exponential backoff
 * - Event-based message handling
 * - Cleanup on component unmount
 *
 * @example
 * ```tsx
 * const { isConnected, addEventListener } = useSSEConnection({
 *   onEvent: {
 *     new_message: (data) => console.log('New message:', data),
 *     new_conversation: (data) => console.log('New conversation:', data),
 *   },
 *   onConnect: () => console.log('Connected to SSE'),
 *   onError: (error) => console.error('SSE error:', error),
 * });
 * ```
 */
export function useSSEConnection(
  options: UseSSEConnectionOptions = {}
): UseSSEConnectionReturn {
  const {
    url = "/api/events/stream",
    autoConnect = true,
    autoReconnect = true,
    maxReconnectAttempts = 5,
    reconnectDelay = 1000,
    maxReconnectDelay = 30000,
    onEvent = {},
    onConnect,
    onDisconnect,
    onError,
  } = options;

  // State
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [error, setError] = useState<Event | null>(null);

  // Refs to persist values across renders without causing re-renders
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const eventHandlersRef = useRef<Map<string, Set<SSEEventHandler>>>(new Map());
  const isManualDisconnectRef = useRef(false);

  /**
   * Calculate reconnection delay with exponential backoff
   */
  const getReconnectDelay = useCallback(
    (attempt: number): number => {
      const delay = reconnectDelay * Math.pow(2, attempt);
      return Math.min(delay, maxReconnectDelay);
    },
    [reconnectDelay, maxReconnectDelay]
  );

  /**
   * Add event listener for a specific event type
   */
  const addEventListener = useCallback(
    (eventType: string, handler: SSEEventHandler) => {
      if (!eventHandlersRef.current.has(eventType)) {
        eventHandlersRef.current.set(eventType, new Set());
      }
      eventHandlersRef.current.get(eventType)!.add(handler);

      // If already connected, attach the listener to EventSource
      if (eventSourceRef.current) {
        eventSourceRef.current.addEventListener(eventType, (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data);
            handler(data);
          } catch (err) {
            console.error(`[SSE] Error parsing event data for ${eventType}:`, err);
            handler(event.data);
          }
        });
      }
    },
    []
  );

  /**
   * Remove event listener for a specific event type
   */
  const removeEventListener = useCallback(
    (eventType: string, handler: SSEEventHandler) => {
      const handlers = eventHandlersRef.current.get(eventType);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          eventHandlersRef.current.delete(eventType);
        }
      }
    },
    []
  );

  /**
   * Disconnect from SSE stream
   */
  const disconnect = useCallback(() => {
    console.log("[SSE] Manually disconnecting from stream");
    isManualDisconnectRef.current = true;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setIsConnected(false);
    setIsReconnecting(false);
    setReconnectAttempt(0);
  }, []);

  /**
   * Connect to SSE stream
   */
  const connect = useCallback(() => {
    // Prevent multiple simultaneous connections
    if (eventSourceRef.current) {
      console.log("[SSE] Already connected or connecting");
      return;
    }

    console.log("[SSE] Connecting to stream:", url);
    isManualDisconnectRef.current = false;

    try {
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      // Handle connection open
      eventSource.onopen = () => {
        console.log("[SSE] Connection established");
        setIsConnected(true);
        setIsReconnecting(false);
        setReconnectAttempt(0);
        setError(null);
        onConnect?.();
      };

      // Handle generic messages (no event type)
      eventSource.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          console.log("[SSE] Received message:", data);
        } catch (err) {
          console.error("[SSE] Error parsing message data:", err);
        }
      };

      // Handle connection errors
      eventSource.onerror = (event: Event) => {
        console.error("[SSE] Connection error:", event);
        setError(event);
        setIsConnected(false);
        onError?.(event);

        // Close the connection
        eventSource.close();
        eventSourceRef.current = null;

        // Attempt to reconnect if enabled and not manually disconnected
        if (autoReconnect && !isManualDisconnectRef.current) {
          if (reconnectAttempt < maxReconnectAttempts) {
            const delay = getReconnectDelay(reconnectAttempt);
            console.log(
              `[SSE] Reconnecting in ${delay}ms (attempt ${reconnectAttempt + 1}/${maxReconnectAttempts})`
            );

            setIsReconnecting(true);
            setReconnectAttempt((prev) => prev + 1);

            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, delay);
          } else {
            console.error("[SSE] Max reconnection attempts reached");
            setIsReconnecting(false);
          }
        }
      };

      // Register custom event handlers from options
      Object.entries(onEvent).forEach(([eventType, handler]) => {
        eventSource.addEventListener(eventType, (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data);
            handler(data);
          } catch (err) {
            console.error(`[SSE] Error parsing event data for ${eventType}:`, err);
            handler(event.data);
          }
        });
      });

      // Register dynamic event handlers
      eventHandlersRef.current.forEach((handlers, eventType) => {
        handlers.forEach((handler) => {
          eventSource.addEventListener(eventType, (event: MessageEvent) => {
            try {
              const data = JSON.parse(event.data);
              handler(data);
            } catch (err) {
              console.error(`[SSE] Error parsing event data for ${eventType}:`, err);
              handler(event.data);
            }
          });
        });
      });

      // Register standard SSE events
      eventSource.addEventListener("connected", (event: MessageEvent) => {
        console.log("[SSE] Connected event received:", event.data);
      });

      eventSource.addEventListener("ping", (event: MessageEvent) => {
        // Keep-alive ping - no action needed
      });
    } catch (err) {
      console.error("[SSE] Failed to create EventSource:", err);
      setError(err as Event);
    }
  }, [
    url,
    autoReconnect,
    maxReconnectAttempts,
    reconnectAttempt,
    getReconnectDelay,
    onConnect,
    onError,
    onEvent,
  ]);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [autoConnect]); // Only run on mount/unmount

  return {
    isConnected,
    isReconnecting,
    reconnectAttempt,
    error,
    connect,
    disconnect,
    addEventListener,
    removeEventListener,
  };
}
