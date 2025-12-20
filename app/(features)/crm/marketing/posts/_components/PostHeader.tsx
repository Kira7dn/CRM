"use client"

import { Button } from "@/@shared/ui/button"
import { BookOpen, Plus, Settings, Sparkles, Save, Undo2 } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import PostContentSettings from "./PostContentSettings"
import ResourceManager from "./ResourceManager"
import { usePostStore } from "../_store/usePostStore"
import { useGenerateSchedule } from "../_hooks/useGenerateSchedule"
import { createPostScheduleAction } from "../_actions/create-post-schedule-action"
import { toast } from "sonner"

type Props = {}

export default function PostHeader(props: Props) {
  const router = useRouter()
  const [showSettings, setShowSettings] = useState(false)
  const [showResourceManager, setShowResourceManager] = useState(false)
  const [saving, setSaving] = useState(false)

  const { previewPosts, clearPreviewPosts, isGeneratingSchedule } = usePostStore()
  const { generateSchedule } = useGenerateSchedule()

  const handleGenerateClick = async () => {
    console.log("handleGenerateClick");

    await generateSchedule()
  }

  const handleSaveSchedule = async () => {
    setSaving(true)
    try {
      const result = await createPostScheduleAction(previewPosts)
      if (result.success) {
        toast.success(`Saved ${result.savedCount} posts to scheduler`)
        clearPreviewPosts()
        window.location.reload()
      } else {
        toast.error(result.error || 'Failed to save schedule')
      }
    } catch (error) {
      toast.error('Failed to save schedule')
    } finally {
      setSaving(false)
    }
  }

  const handleUndoSchedule = () => {
    clearPreviewPosts()
    toast.info('Cleared preview posts')
  }
  return (
    <div className="flex items-center justify-between">
      <div className="w-1/3">
        <h1 className="text-3xl font-bold">Social Media Posts</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage multi-platform content for Facebook, TikTok, Zalo, and YouTube
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setShowSettings(true)}
          className="gap-2"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowResourceManager(true)}
          className="gap-2"
        >
          <BookOpen className="h-4 w-4" />
          Quản lý Tài liệu
        </Button>

        {previewPosts.length === 0 ? (
          <Button
            variant="outline"
            onClick={handleGenerateClick}
            disabled={isGeneratingSchedule}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4 text-primary hover:text-white" />
            {isGeneratingSchedule ? 'Generating...' : 'Lên lịch đăng'}
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={handleUndoSchedule}
              className="gap-2"
            >
              <Undo2 className="h-4 w-4" />
              Undo ({previewPosts.length})
            </Button>
            <Button
              onClick={handleSaveSchedule}
              disabled={saving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : `Save ${previewPosts.length} Posts`}
            </Button>
          </>
        )}

        <Button
          onClick={() => router.push('/crm/marketing/posts/new')}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          New Post
        </Button>
      </div>
      {/* Settings Modal */}
      <PostContentSettings
        open={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Resource Manager */}
      <ResourceManager
        open={showResourceManager}
        onClose={() => setShowResourceManager(false)}
      />
    </div >
  )
}