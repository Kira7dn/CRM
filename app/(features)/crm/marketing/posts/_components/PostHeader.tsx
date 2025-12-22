"use client"

import { Button } from "@/@shared/ui/button"
import { BookOpen, Settings } from "lucide-react"
import { useState } from "react"

import PostContentSettings from "./PostContentSettings"
import ResourceManager from "./ResourceManager"
import { usePostStore } from "../_store/usePostStore"


type Props = {}

export default function PostHeader(props: Props) {
  const { openPostContentSettings } = usePostStore()
  const [showResourceManager, setShowResourceManager] = useState(false)

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
          onClick={openPostContentSettings}
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


      </div>
      {/* Settings Modal */}
      <PostContentSettings />

      {/* Resource Manager */}
      <ResourceManager
        open={showResourceManager}
        onClose={() => setShowResourceManager(false)}
      />
    </div >
  )
}