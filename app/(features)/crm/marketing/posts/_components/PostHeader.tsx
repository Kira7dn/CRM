"use client"

import { Button } from "@/@shared/ui/button"
import { BookOpen, Plus, Settings, Sparkles } from "lucide-react"
import { useState } from "react"
import PostContentSettings from "./PostContentSettings"
import ResourceManager from "./ResourceManager"

type Props = {}


export default function PostHeader(props: Props) {
  const [showSettings, setShowSettings] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [showResourceManager, setShowResourceManager] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showCreatePost, setShowCreatePost] = useState(false)
  return (
    < div className="flex items-center justify-between" >
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
        <Button
          variant="outline"
          // onClick={handleGenerateSchedule}
          disabled={generating}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4 text-primary hover:text-white" />
          {generating ? 'Generating...' : 'Lên lịch đăng'}
        </Button>
        <Button
          // onClick={handleCreateNewPost}
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