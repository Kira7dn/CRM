"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/ui/card"
import { Button } from "@shared/ui/button"
import { CheckCircle2, XCircle, Loader2, ExternalLink, RefreshCw, Settings, Webhook, Unplug } from "lucide-react"
import type { SocialPlatform } from "@/core/domain/social/social-auth"
import ConfigurationDialog from "./ConfigurationDialog"

interface Connection {
  id: string
  platform: SocialPlatform
  openId: string
  expiresAt: string
  createdAt: string
  scope?: string
}

interface SocialConnectionsManagerProps {
  connections: Connection[]
}

const PLATFORMS = [
  {
    id: "zalo" as SocialPlatform,
    name: "Zalo",
    description: "Connect with customers via Zalo OA",
    color: "bg-[#0068FF]",
    icon: (
      <svg className="h-8 w-8 fill-white" viewBox="0 0 24 24">
        <path d="M12 0C5.373 0 0 4.97 0 11.111c0 3.497 1.745 6.616 4.472 8.652V24l4.086-2.242c1.104.305 2.279.464 3.442.464 6.627 0 12-4.974 12-11.111C24 4.97 18.627 0 12 0zm.676 14.842h-5.16c-.415 0-.75-.224-.75-.5s.335-.5.75-.5h5.16c.414 0 .75.224.75.5s-.336.5-.75.5zm2.858-3.643h-8.02c-.414 0-.75-.224-.75-.5s.336-.5.75-.5h8.02c.414 0 .75.224.75.5s-.336.5-.75.5zm0-3.286h-8.02c-.414 0-.75-.224-.75-.5s.336-.5.75-.5h8.02c.414 0 .75.224.75.5s-.336.5-.75.5z" />
      </svg>
    ),
  },
  {
    id: "tiktok" as SocialPlatform,
    name: "TikTok",
    description: "Publish videos and track analytics",
    color: "bg-black dark:bg-white",
    icon: (
      <svg className="h-8 w-8 fill-white dark:fill-black" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
      </svg>
    ),
  },
  {
    id: "facebook" as SocialPlatform,
    name: "Facebook",
    description: "Share posts and engage with your audience",
    color: "bg-[#1877F2]",
    icon: (
      <svg className="h-8 w-8 fill-white" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    id: "youtube" as SocialPlatform,
    name: "YouTube",
    description: "Upload videos and manage your channel",
    color: "bg-[#FF0000]",
    icon: (
      <svg className="h-8 w-8 fill-white" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    id: "wordpress" as SocialPlatform,
    name: "WordPress",
    description: "Publish blog posts to your WordPress site",
    color: "bg-[#21759B]",
    icon: (
      <svg className="h-8 w-8 fill-white" viewBox="0 0 24 24">
        <path d="M21.469 6.825c.84 1.537 1.318 3.3 1.318 5.175 0 3.979-2.156 7.456-5.363 9.325l3.295-9.527c.615-1.54.82-2.771.82-3.864 0-.405-.026-.78-.07-1.11m-7.981.105c.647-.03 1.232-.105 1.232-.105.582-.075.514-.93-.067-.899 0 0-1.755.135-2.88.135-1.064 0-2.85-.15-2.85-.15-.585-.03-.661.855-.075.885 0 0 .54.061 1.125.09l1.68 4.605-2.37 7.08L5.354 6.9c.649-.03 1.234-.1 1.234-.1.585-.075.516-.93-.065-.896 0 0-1.746.138-2.874.138-.2 0-.438-.008-.69-.015C4.911 3.15 8.235 1.215 12 1.215c2.809 0 5.365 1.072 7.286 2.833-.046-.003-.091-.009-.141-.009-1.06 0-1.812.923-1.812 1.914 0 .89.513 1.643 1.06 2.531.411.72.89 1.643.89 2.977 0 .915-.354 1.994-.821 3.479l-1.075 3.585-3.9-11.61.001.014zM12 22.784c-1.059 0-2.081-.153-3.048-.437l3.237-9.406 3.315 9.087c.024.053.05.101.078.149-1.12.393-2.325.607-3.582.607M1.211 12c0-1.564.336-3.05.935-4.39L7.29 21.709C3.694 19.96 1.212 16.271 1.211 12M12 0C5.385 0 0 5.385 0 12s5.385 12 12 12 12-5.385 12-12S18.615 0 12 0" />
      </svg>
    ),
  },
]

export default function SocialConnectionsManager({ connections: initialConnections }: SocialConnectionsManagerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [connections, setConnections] = useState<Connection[]>(initialConnections)
  const [loadingPlatform, setLoadingPlatform] = useState<SocialPlatform | null>(null)
  const [message, setMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)
  const [showConfigDialog, setShowConfigDialog] = useState(false)
  const [configPlatform, setConfigPlatform] = useState<SocialPlatform | null>(null)
  const [configConnectionId, setConfigConnectionId] = useState<string | null>(null)

  // Handle OAuth callback status
  useEffect(() => {
    const success = searchParams.get("success")
    const error = searchParams.get("error")
    const platform = searchParams.get("platform") as SocialPlatform | null

    if (success === "true" && platform) {
      setMessage({
        type: "success",
        text: `${platform.charAt(0).toUpperCase() + platform.slice(1)} account connected successfully!`,
      })

      // Show configuration dialog for the newly connected platform
      const connection = connections.find(c => c.platform === platform)
      if (connection) {
        setConfigPlatform(platform)
        setConfigConnectionId(connection.id)
        setShowConfigDialog(true)
      }

      // Refresh connections
      router.refresh()
      // Clear URL params
      router.replace("/crm/social/connections")
    } else if (error) {
      setMessage({
        type: "error",
        text: `Failed to connect: ${decodeURIComponent(error)}`,
      })
    }
  }, [searchParams, router, connections])

  const handleConnect = (platform: SocialPlatform) => {
    setLoadingPlatform(platform)
    // Redirect to OAuth start endpoint
    window.location.href = `/api/auth/${platform}/start`
  }

  const handleDisconnect = async (platform: SocialPlatform) => {
    if (!confirm(`Are you sure you want to disconnect your ${platform} account?`)) {
      return
    }

    setLoadingPlatform(platform)
    try {
      const response = await fetch(`/api/auth/${platform}/disconnect`, {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to disconnect")
      }

      setMessage({
        type: "success",
        text: data.message || `${platform} account disconnected successfully`,
      })

      // Remove connection from state
      setConnections(connections.filter(c => c.platform !== platform))
      router.refresh()
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to disconnect",
      })
    } finally {
      setLoadingPlatform(null)
    }
  }

  const handleRefresh = async (platform: SocialPlatform) => {
    setLoadingPlatform(platform)
    try {
      const response = await fetch(`/api/auth/${platform}/refresh`, {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to refresh token")
      }

      setMessage({
        type: "success",
        text: `${platform} token refreshed successfully`,
      })
      router.refresh()
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to refresh token",
      })
    } finally {
      setLoadingPlatform(null)
    }
  }

  const getConnectionForPlatform = (platform: SocialPlatform) => {
    return connections.find(c => c.platform === platform)
  }

  const isExpiringSoon = (expiresAt: string) => {
    const daysUntilExpiry = Math.floor((new Date(expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 7 && daysUntilExpiry >= 0
  }

  return (
    <div className="space-y-4">
      {/* Status Message */}
      {message && (
        <div
          className={`p-4 rounded-lg border ${message.type === "success"
            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
            : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
            }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
            <p>{message.text}</p>
          </div>
        </div>
      )}

      {/* Platform Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {PLATFORMS.map((platform) => {
          const connection = getConnectionForPlatform(platform.id)
          const isConnected = !!connection
          const isLoading = loadingPlatform === platform.id
          const expiringSoon = connection && isExpiringSoon(connection.expiresAt)

          return (
            <Card key={platform.id} className={expiringSoon ? "border-yellow-500" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-lg ${platform.color} flex items-center justify-center`}>
                      {platform.icon}
                    </div>
                    <div>
                      <CardTitle>{platform.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {platform.description}
                      </CardDescription>
                    </div>
                  </div>
                </div>
                <div
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium w-fit ${isConnected
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    }`}
                >
                  {isConnected ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Connected
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4" />
                      Not Connected
                    </>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {isConnected && connection ? (
                  <div className="space-y-3">
                    {/* Connection Details */}
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Connected:</span>
                        <span>
                          {connection.createdAt
                            ? new Date(connection.createdAt).toLocaleDateString()
                            : "Unknown"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Expires:</span>
                        <span className={expiringSoon ? "text-yellow-600 dark:text-yellow-400 font-medium" : ""}>
                          {new Date(connection.expiresAt).toLocaleDateString()}
                          {expiringSoon && " (Soon!)"}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setConfigPlatform(platform.id)
                          setConfigConnectionId(connection.id)
                          setShowConfigDialog(true)
                        }}
                        disabled={isLoading}
                      >
                        <Webhook className="h-4 w-4 mr-1" />
                        Webhook
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRefresh(platform.id)}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-1" />
                        )}
                        Refresh
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnect(platform.id)}
                        disabled={isLoading}
                      >
                        <Unplug className="h-4 w-4 mr-1" />
                        Disconnect
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleConnect(platform.id)}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Connect {platform.name}
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Configuration Dialog */}
      {showConfigDialog && configPlatform && (
        <ConfigurationDialog
          open={showConfigDialog}
          onOpenChange={setShowConfigDialog}
          platform={configPlatform}
        />
      )}
    </div>
  )
}
