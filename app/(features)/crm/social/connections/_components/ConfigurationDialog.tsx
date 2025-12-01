"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@shared/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/ui/tabs"
import { Button } from "@shared/ui/button"
import type { SocialPlatform } from "@/core/domain/social/social-auth"
import WebhookGuidePanel from "./WebhookGuidePanel"

interface ConfigurationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  platform: SocialPlatform
  connectionId: string
}

export default function ConfigurationDialog({
  open,
  onOpenChange,
  platform,
  connectionId,
}: ConfigurationDialogProps) {
  const [activeTab, setActiveTab] = useState("settings")
  const [loading, setLoading] = useState(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Configure {platform.charAt(0).toUpperCase() + platform.slice(1)}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="webhook">Webhook Setup</TabsTrigger>
          </TabsList>
          <TabsContent value="webhook" className="space-y-4 mt-4">
            <WebhookGuidePanel platform={platform} />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
