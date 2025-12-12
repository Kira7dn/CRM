# Instagram Webhooks Implementation

## Overview

This implementation provides secure Instagram webhook handling with mTLS (Mutual TLS) authentication as per Facebook's security requirements.

## Files Created

### `/app/api/webhooks/instagram/route.ts`

Complete webhook endpoint with:
- **mTLS Authentication**: Client certificate verification
- **HMAC-SHA256 Signature Verification**: Payload integrity validation
- **Webhook Subscription**: GET endpoint for Facebook verification
- **Event Processing**: POST endpoint for handling webhook events

## Security Features

### 1. mTLS (Mutual TLS) Authentication
```typescript
function verifyClientCertificate(clientCertHeader: string | null): boolean {
  // Validates client certificates from Facebook
  // Prevents unauthorized webhook calls
}
```

### 2. Signature Verification
```typescript
function verifyWebhookSignature(body: string, signature: string | null): boolean {
  // HMAC-SHA256 verification using app secret
  // Timing-safe comparison to prevent timing attacks
}
```

### 3. Webhook Verification
```typescript
// GET /api/webhooks/instagram?hub.mode=subscribe&hub.verify_token=TOKEN&hub.challenge=CHALLENGE
// Returns challenge token to verify webhook endpoint
```

## Environment Variables Required

```env
# Instagram/Facebook App Configuration
INSTAGRAM_APP_ID=your_app_id
INSTAGRAM_APP_SECRET=your_app_secret
INSTAGRAM_VERIFY_TOKEN=your_custom_verify_token

# Optional: For development
NODE_ENV=development
```

## Webhook Events Supported

- **feed**: New posts, comments, likes
- **mentions**: Account mentions
- **story_insights**: Story performance metrics  
- **media**: Media updates (uploads, deletions)

## Setup Instructions

### 1. Configure Facebook App
1. Go to Facebook Developers Dashboard
2. Add Webhooks product to your app
3. Set webhook URL: `https://yourdomain.com/api/webhooks/instagram`
4. Enable mTLS for enhanced security

### 2. Subscribe to Instagram Fields
```bash
# Subscribe to feed updates
curl -X POST \
  "https://graph.facebook.com/v19.0/{app-id}/subscriptions" \
  -d "object=instagram" \
  -d "callback_url=https://yourdomain.com/api/webhooks/instagram" \
  -d "fields=feed,mentions,story_insights,media" \
  -d "verify_token=your_verify_token"
```

### 3. Production Deployment
- Configure SSL/TLS certificates
- Set up mTLS with trusted CA certificates
- Ensure webhook endpoint is publicly accessible
- Monitor webhook delivery logs

## Development Notes

- In development mode, mTLS verification is relaxed for easier testing
- Always use HTTPS in production
- Monitor webhook delivery success rates
- Implement retry logic for failed webhook processing

## Integration Points

The webhook handlers are designed to integrate with:
- Post management system (update engagement metrics)
- Notification system (send alerts for mentions)
- Analytics system (store insights data)
- Media management (handle media updates)

## Error Handling

- 401: Unauthorized (invalid certificate or signature)
- 403: Verification failed
- 500: Internal server error
- Detailed error logging for debugging

## Next Steps

1. Implement specific business logic in webhook handlers
2. Set up monitoring and alerting
3. Test webhook delivery with Facebook's webhook testing tools
4. Configure production mTLS certificates
