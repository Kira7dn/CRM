"use client"

import { Button } from "@/@shared/ui/button"
import { BookOpen, Plus, Settings, Sparkles, Save, Undo2 } from "lucide-react"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import PostContentSettings from "./PostContentSettings"
import ResourceManager from "./ResourceManager"
import { usePostStore } from "../_store/usePostStore"
import { useGenerateSchedule } from "../_hooks/useGenerateSchedule"
import { createPlanAction } from "../_actions/create-planner-action"
import { toast } from "sonner"
import { useCopilotChatSuggestions } from "@copilotkit/react-ui"

type Props = {}

export default function PostHeader(props: Props) {
  const router = useRouter()
  const [showSettings, setShowSettings] = useState(false)
  const [showResourceManager, setShowResourceManager] = useState(false)
  const [saving, setSaving] = useState(false)

  const { previewPosts, clearPreviewPosts, isGeneratingSchedule } = usePostStore()
  const { generateSchedule, saveSchedule, undoSchedule, hasPreview, previewCount } = useGenerateSchedule()
  // useCopilotChatSuggestions(
  //   {
  //     instructions: "Suggest user to create schedule then suggest save or undo after hasPreview",
  //     minSuggestions: 1,
  //     maxSuggestions: 2,
  //   },
  //   [],
  // );

  // Use CopilotKit's built-in hook for dynamic suggestions
  // useCopilotChatSuggestions({
  //   instructions: hasPreview
  //     ? "User has generated a post schedule with preview posts. Suggest actions to save, undo, or regenerate the schedule."
  //     : "User hasn't generated a post schedule yet. Suggest creating a new schedule.",
  //   suggestions: hasPreview
  //     ? [
  //       { title: "💾 Save schedule", message: "Save the generated post schedule to database." },
  //       { title: "↩️ Undo schedule", message: "Discard the generated schedule and start over." },
  //       { title: "🔄 Regenerate schedule", message: "Generate a new post schedule with different ideas." }
  //     ]
  //     : [
  //       { title: "Create post schedule", message: "Create a post schedule for next month with selected products." }
  //     ]
  // }, [hasPreview])

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="w-full sm:w-1/3">
        <h1 className="text-2xl sm:text-3xl font-bold">Social Media Posts</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">
          Manage multi-platform content for Facebook, TikTok, Zalo, and YouTube
        </p>
      </div>
      <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:gap-2">
        <Button
          variant="outline"
          onClick={() => setShowSettings(true)}
          className="gap-2 text-xs sm:text-sm px-2 sm:px-3"
          size="sm"
        >
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Settings</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowResourceManager(true)}
          className="gap-2 text-xs sm:text-sm px-2 sm:px-3"
          size="sm"
        >
          <BookOpen className="h-4 w-4" />
          <span className="hidden sm:inline">Quản lý Tài liệu</span>
        </Button>

        {previewPosts.length === 0 ? (
          <Button
            variant="outline"
            onClick={generateSchedule}
            disabled={isGeneratingSchedule}
            className="gap-2 text-xs sm:text-sm px-2 sm:px-3"
            size="sm"
          >
            <Sparkles className="h-4 w-4 text-primary hover:text-white" />
            <span className="hidden sm:inline">{isGeneratingSchedule ? 'Generating...' : 'Lên lịch đăng'}</span>
            <span className="sm:hidden">{isGeneratingSchedule ? '...' : 'Lên lịch'}</span>
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={undoSchedule}
              className="gap-2 text-xs sm:text-sm px-2 sm:px-3"
              size="sm"
            >
              <Undo2 className="h-4 w-4" />
              <span className="hidden sm:inline">Undo ({previewPosts.length})</span>
              <span className="sm:hidden">Undo</span>
            </Button>
            <Button
              onClick={saveSchedule}
              disabled={saving}
              className="gap-2 text-xs sm:text-sm px-2 sm:px-3"
              size="sm"
            >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">{saving ? 'Saving...' : `Save ${previewPosts.length} Posts`}</span>
              <span className="sm:hidden">{saving ? '...' : 'Save'}</span>
            </Button>
          </>
        )}

        <Button
          onClick={() => router.push('/crm/marketing/posts/new')}
          className="gap-2 text-xs sm:text-sm px-2 sm:px-3"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Post</span>
          <span className="sm:hidden">New</span>
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