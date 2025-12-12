"use client"

import { useState } from "react"
import { Button } from "@shared/ui/button"
import { Alert, AlertDescription } from "@shared/ui/alert"
import { CheckCircle2, Copy, ExternalLink } from "lucide-react"
import type { SocialPlatform } from "@/core/domain/social/social-auth"

interface WebhookGuidePanelProps {
  platform: SocialPlatform
}

export default function WebhookGuidePanel({ platform }: WebhookGuidePanelProps) {
  const [copied, setCopied] = useState(false)

  const webhookUrl = typeof window !== "undefined"
    ? `${window.location.origin}/api/webhooks/${platform}`
    : `/api/webhooks/${platform}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(webhookUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const renderZaloGuide = () => (
    <div className="space-y-4">

      <div className="space-y-3">
        <h3 className="font-semibold">Step-by-Step Guide:</h3>

        <ol className="space-y-3 list-decimal list-inside">
          <li>
            Go to{" "}
            <a
              href="https://developers.zalo.me"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline inline-flex items-center gap-1"
            >
              Zalo Developer Portal
              <ExternalLink className="h-3 w-3" />
            </a>
          </li>

          <li>Select your Official Account (OA) application</li>

          <li>Navigate to <strong>Webhook Settings</strong> or <strong>Cài đặt Webhook</strong></li>

          <li>
            Enter your webhook URL:
            <div className="flex items-center gap-2 mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-md font-mono text-sm">
              <code className="flex-1 break-all">{webhookUrl}</code>
              <Button
                size="sm"
                variant="ghost"
                onClick={copyToClipboard}
                className="shrink-0"
              >
                {copied ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </li>

          <li>Zalo will send a verification request to your webhook URL</li>

          <li>
            After successful verification, enable these event subscriptions:
            <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-sm">
              <li><code>user_send_text</code> - Text messages</li>
              <li><code>user_send_image</code> - Image messages</li>
              <li><code>user_send_file</code> - File attachments</li>
              <li><code>user_send_audio</code> - Audio messages</li>
              <li><code>user_send_video</code> - Video messages</li>
            </ul>
          </li>

          <li>Save your webhook configuration</li>
        </ol>
      </div>
    </div>
  )

  const renderTikTokGuide = () => (
    <div className="space-y-4">

      <div className="space-y-3">
        <h3 className="font-semibold">Step-by-Step Guide:</h3>

        <ol className="space-y-3 list-decimal list-inside">
          <li>
            Go to{" "}
            <a
              href="https://developers.tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline inline-flex items-center gap-1"
            >
              TikTok Developer Portal
              <ExternalLink className="h-3 w-3" />
            </a>
          </li>

          <li>Select your application</li>

          <li>Go to <strong>Webhook Settings</strong></li>

          <li>
            Register your callback URL:
            <div className="flex items-center gap-2 mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-md font-mono text-sm">
              <code className="flex-1 break-all">{webhookUrl}</code>
              <Button
                size="sm"
                variant="ghost"
                onClick={copyToClipboard}
                className="shrink-0"
              >
                {copied ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </li>

          <li>
            Your endpoint must:
            <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-sm">
              <li>Use HTTPS (not HTTP)</li>
              <li>Respond with 200 status code immediately</li>
              <li>Handle GET request with <code>challenge</code> parameter for verification</li>
            </ul>
          </li>

          <li>TikTok will verify your webhook by sending a GET request</li>

          <li>After verification, you'll start receiving POST requests for events</li>
        </ol>
      </div>
    </div>
  )

  const renderFacebookGuide = () => (
    <div className="space-y-4">

      <div className="space-y-3">
        <h3 className="font-semibold">No need to set up webhook:</h3>

        <ul className="space-y-2 list-disc list-inside">
          When you select a  Facebook Page during OAuth, the system automatically subscribes
          to webhook events:
          <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-sm">
            <li><code>messages</code> - Incoming messages</li>
            <li><code>messaging_postbacks</code> - Button clicks and interactions</li>
          </ul>
        </ul>
      </div>
    </div>
  )

  const renderInstagramGuide = () => (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="font-semibold">Instagram Webhook Setup:</h3>

        <Alert>
          <AlertDescription>
            Instagram webhooks are configured through Facebook App settings since Instagram is part of Meta's ecosystem.
          </AlertDescription>
        </Alert>

        <ol className="space-y-3 list-decimal list-inside">
          <li>
            Go to{" "}
            <a
              href="https://developers.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline inline-flex items-center gap-1"
            >
              Facebook Developers Portal
              <ExternalLink className="h-3 w-3" />
            </a>
          </li>

          <li>Select your app that has Instagram products configured</li>

          <li>Navigate to <strong>Webhooks</strong> in the left menu</li>

          <li>
            Configure webhook URL:
            <div className="flex items-center gap-2 mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-md font-mono text-sm">
              <code className="flex-1 break-all">{webhookUrl}</code>
              <Button
                size="sm"
                variant="ghost"
                onClick={copyToClipboard}
                className="shrink-0"
              >
                {copied ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </li>

          <li>
            Subscribe to Instagram fields:
            <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-sm">
              <li><code>feed</code> - New posts, comments, likes</li>
              <li><code>mentions</code> - Account mentions</li>
              <li><code>story_insights</code> - Story performance metrics</li>
              <li><code>media</code> - Media updates</li>
            </ul>
          </li>

          <li>
            For enhanced security, enable mTLS (Mutual TLS):
            <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-sm">
              <li>Upload your server certificate</li>
              <li>Configure client certificate validation</li>
              <li>Test webhook delivery with mTLS enabled</li>
            </ul>
          </li>

          <li>Save and test your webhook configuration</li>
        </ol>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {platform === "zalo" && renderZaloGuide()}
      {platform === "tiktok" && renderTikTokGuide()}
      {platform === "facebook" && renderFacebookGuide()}
      {platform === "instagram" && renderInstagramGuide()}
      {platform === "youtube" && (
        <Alert>
          <AlertDescription>
            YouTube webhook guide coming soon...
          </AlertDescription>
        </Alert>
      )}
      {platform === "wordpress" && (
        <Alert>
          <AlertDescription>
            WordPress webhook guide coming soon...
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
