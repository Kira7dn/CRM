# Server-Sent Events (SSE) Realtime System

## Overview
Implement real-time updates for the CRM messaging system using Server-Sent Events (SSE) to replace polling mechanism. This will provide instant updates for messages, conversations, and customer data without constantly hitting the server.

## Goals
- Replace polling mechanism with SSE for real-time updates
- Reduce server load by eliminating frequent polling requests
- Improve user experience with instant (<1s) updates
- Support multiple event types: messages, conversations, customers

## Architecture

### Backend Components

1. **SSE Event Stream Endpoint**
   - Create `/api/events/stream` route
   - Maintain active client connections using WritableStream
   - Send keep-alive pings every 15 seconds
   - Clean up connections on client disconnect

2. **Broadcast Helper Function**
   - Global `broadcastEvent(event, data)` function
   - Encode events in SSE format: `event: {type}\ndata: {JSON}\n\n`
   - Iterate through all connected clients and send events

3. **Integration Points**
   - Webhook handlers (Facebook, Zalo, TikTok) - emit `new_message`, `new_conversation`
   - Customer CRUD actions - emit `customer_created`, `customer_updated`, `customer_deleted`
   - Message send action - emit `message_sent`
   - Conversation status updates - emit `conversation_updated`

### Frontend Components

1. **SSE Connection Manager**
   - Establish EventSource connection to `/api/events/stream`
   - Handle reconnection on disconnect
   - Clean up on component unmount

2. **Event Listeners**
   - `new_message` - Add message to current conversation
   - `new_conversation` - Prepend to conversation list
   - `message_sent` - Update message delivery status
   - `conversation_updated` - Update conversation in list
   - `customer_created` - Add customer to list
   - `customer_updated` - Update customer in list
   - `customer_deleted` - Remove customer from list

## Event Types

### Message Events
```typescript
{
  event: "new_message",
  data: {
    id: string,
    conversationId: string,
    sender: "customer" | "agent",
    content: string,
    sentAt: Date,
    platformMessageId?: string
  }
}
```

### Conversation Events
```typescript
{
  event: "new_conversation",
  data: {
    id: string,
    channelId: string,
    customerId: string,
    platform: Platform,
    status: ConversationStatus,
    lastMessageAt: Date
  }
}
```

### Customer Events
```typescript
{
  event: "customer_created" | "customer_updated" | "customer_deleted",
  data: {
    id: string,
    name?: string,
    phone?: string,
    // ... other customer fields or just { id } for delete
  }
}
```

## Implementation Tasks

### Phase 1: SSE Infrastructure
1. Create SSE stream endpoint `/api/events/stream`
2. Implement client connection management
3. Create `broadcastEvent` helper function
4. Add keep-alive ping mechanism

### Phase 2: Backend Integration
1. Integrate SSE events in webhook handlers
   - Facebook webhook - emit message/conversation events
   - Zalo webhook - emit message/conversation events
   - TikTok webhook - emit message/conversation events

2. Integrate SSE events in server actions
   - Send message action - emit `message_sent`
   - Customer CRUD actions - emit customer events
   - Conversation update actions - emit `conversation_updated`

### Phase 3: Frontend Integration
1. Create SSE connection hook (`useSSEConnection`)
2. Update MessageManagementClient to use SSE
   - Replace polling with SSE subscription
   - Handle real-time message updates
   - Handle real-time conversation updates

3. Update customer management to use SSE
   - Real-time customer list updates
   - Remove manual refresh requirement

### Phase 4: Error Handling & Optimization
1. Implement reconnection logic with exponential backoff
2. Handle SSE connection errors gracefully
3. Add connection status indicator in UI
4. Optimize event filtering (only send relevant events to each client)
5. Add event acknowledgment mechanism

## Testing Strategy
- Test SSE connection establishment and keep-alive
- Test event broadcasting to multiple clients
- Test automatic reconnection on disconnect
- Test event handling in frontend components
- Load test with multiple concurrent SSE connections
- Test memory leak prevention (connection cleanup)

## Success Metrics
- Eliminate polling requests (0 polling API calls)
- Reduce message delivery latency to <1 second
- Reduce server CPU usage by 30-50% (no more polling)
- Improve user experience (instant updates)

## Technical Considerations
- SSE is one-way (server → client), use POST for client → server
- Maximum connection limits per browser (typically 6 per domain)
- Consider authentication/authorization for SSE connections
- Handle connection drops gracefully
- Monitor memory usage for long-lived connections
