# Batch Save Streaming API

## Overview
Streaming API endpoint for saving multiple posts in batch with real-time progress updates.

## Endpoint
```
POST /api/posts/batch-save/stream
```

## Request Format
```typescript
{
  items: Array<{
    idea: string          // Post content/title
    scheduledDate: string // Format: "YYYY-MM-DD"
  }>
}
```

## Response Format (SSE - Server-Sent Events)
```
Content-Type: text/event-stream
```

### Event Types

#### 1. `start` - Initial event
```json
{
  "type": "start",
  "total": 30,
  "savedCount": 0,
  "progress": 0
}
```

#### 2. `progress` - After each post saved
```json
{
  "type": "progress",
  "total": 30,
  "savedCount": 5,
  "failedCount": 0,
  "progress": 17,
  "currentIndex": 5,
  "postId": "123",
  "idea": "Post content here"
}
```

#### 3. `item-error` - When a single post fails
```json
{
  "type": "item-error",
  "idea": "Failed post content",
  "error": "Validation error message",
  "savedCount": 5,
  "failedCount": 1
}
```

#### 4. `complete` - All posts processed
```json
{
  "type": "complete",
  "total": 30,
  "savedCount": 28,
  "failedCount": 2,
  "errors": [
    { "idea": "...", "error": "..." }
  ],
  "progress": 100
}
```

#### 5. `error` - Fatal error
```json
{
  "type": "error",
  "message": "Database connection failed",
  "savedCount": 10,
  "failedCount": 0
}
```

## Benefits

### 💰 Cost Efficiency
- **1 serverless invocation** instead of N invocations
- **1 connection** instead of N HTTP requests
- **~90% reduction** in Vercel function calls

### ⚡ Performance
- **Parallel processing** on server side
- **No network overhead** between items
- **Faster overall** completion time

### 🎯 User Experience
- **Real-time progress** updates
- **Immediate feedback** per item
- **Resilient** - continues on errors
- **Accurate progress** percentage

## Client Implementation

```typescript
const response = await fetch('/api/posts/batch-save/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ items: posts }),
})

const reader = response.body.getReader()
const decoder = new TextDecoder()

while (true) {
  const { done, value } = await reader.read()
  if (done) break

  const chunk = decoder.decode(value)
  // Parse SSE events and update UI
}
```

## Error Handling

- Individual item failures do NOT stop the batch
- Failed items are reported via `item-error` events
- Final `complete` event includes all errors
- Fatal errors use `error` event and close stream

## Limits

- **Max duration**: 60 seconds (Vercel limit)
- **Recommended batch size**: < 100 posts
- **Runtime**: Node.js (required for streaming)
