"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/ui/card"
import { Button } from "@shared/ui/button"
import { Loader2, Globe, CheckCircle2, Info } from "lucide-react"
import { Alert, AlertDescription } from "@shared/ui/alert"

export default function WordPressSetupPage() {
  const router = useRouter()
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    // Auto-start OAuth flow after a short delay
    const timer = setTimeout(() => {
      handleConnect()
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleConnect = () => {
    setIsConnecting(true)
    // Redirect directly to Jetpack OAuth
    window.location.href = '/api/auth/wordpress/authorize'
  }

  return (
    <div className="container mx-auto max-w-2xl p-6 space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => router.push("/crm/social/connections")}
          className="mb-4"
        >
          ← Back to Connections
        </Button>
        <h1 className="text-3xl font-bold">Connect WordPress</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Connect your WordPress.com or self-hosted WordPress site via Jetpack
        </p>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Jetpack OAuth Connection
          </CardTitle>
          <CardDescription>
            Securely connect your WordPress site using Jetpack OAuth
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isConnecting ? (
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="text-center space-y-2">
                <p className="font-semibold">Connecting to WordPress...</p>
                <p className="text-sm text-gray-500">
                  You will be redirected to WordPress.com to authorize access
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-900/20">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-semibold text-blue-900 dark:text-blue-100">
                      Universal WordPress Connection
                    </div>
                    <AlertDescription className="mt-1 text-blue-800 dark:text-blue-200">
                      Jetpack OAuth works with both WordPress.com sites and self-hosted WordPress sites that have Jetpack installed.
                    </AlertDescription>
                  </div>
                </div>
              </Alert>

              <Button onClick={handleConnect} className="w-full" size="lg">
                <Globe className="h-5 w-5 mr-2" />
                Connect with WordPress
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Requirements Card */}
      <Card className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100 text-base flex items-center gap-2">
            <Info className="h-5 w-5" />
            Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-700 dark:text-gray-300 space-y-3">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-green-600" />
            <div>
              <strong>WordPress.com sites:</strong> Work immediately, no additional setup needed
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-green-600" />
            <div>
              <strong>Self-hosted WordPress:</strong> Requires Jetpack plugin to be installed and connected
            </div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mt-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
              <strong>Important:</strong> You must have at least one WordPress site connected to your WordPress.com account:
            </p>
            <ul className="text-sm text-yellow-800 dark:text-yellow-200 list-disc list-inside space-y-1 ml-2">
              <li>For <strong>WordPress.com</strong> sites: They are automatically connected</li>
              <li>For <strong>self-hosted</strong> sites: Install and connect Jetpack plugin first</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Features Card */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100 text-base">
            What You Can Do After Connecting
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
            <div>Publish blog posts directly from the CRM</div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
            <div>Schedule WordPress content alongside other social platforms</div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
            <div>Manage multiple WordPress sites from one dashboard</div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
            <div>Include WordPress in your cross-platform campaigns</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
