'use client'

import { useState } from 'react'
import { Plus, Settings, Calendar, BookOpen, Loader2 } from 'lucide-react'
import { Button } from '@shared/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shared/ui/dialog'
import PostsView from './PostsView'
import PostFormModal from './PostFormModal'
import PostContentSettings from './PostContentSettings'
import ResourceManager from './ResourceManager'
import type { Post } from '@/core/domain/marketing/post'
import { useScheduledPostUpdater } from '../_hooks/useScheduledPostUpdater'
import { toast } from 'sonner'
import { saveScheduleToPostsAction } from '../actions'

interface PostsPageClientProps {
  initialPosts: Post[]
}

interface PostScheduleItem {
  title: string
  idea: string
  scheduledDate: string
  platform: string
}

export default function PostsPageClient({ initialPosts }: PostsPageClientProps) {
  const [showSettings, setShowSettings] = useState(false)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [showResourceManager, setShowResourceManager] = useState(false)
  const [generatedSchedule, setGeneratedSchedule] = useState<PostScheduleItem[]>([])
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)

  // Auto-update scheduled posts to published when time passes
  useScheduledPostUpdater()

  const handleGenerateSchedule = async () => {
    setGenerating(true)
    try {
      const startDate = new Date()
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

      const res = await fetch('/api/content-generation/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to generate schedule')
      }

      const data = await res.json()
      setGeneratedSchedule(data.schedule || [])
      setShowScheduleDialog(true)
      toast.success(`Generated ${data.schedule?.length || 0} post ideas`)
    } catch (error) {
      console.error('[Schedule] Generation failed:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate schedule')
    } finally {
      setGenerating(false)
    }
  }

  const handleSaveSchedule = async () => {
    if (generatedSchedule.length === 0) {
      toast.error('No schedule items to save')
      return
    }

    setSaving(true)
    try {
      const result = await saveScheduleToPostsAction(generatedSchedule)

      if (!result.success) {
        throw new Error(result.error || 'Failed to save schedule')
      }

      // Show success message
      toast.success(`Saved ${result.savedCount || 0} posts to scheduler`, {
        description: (result.failedCount || 0) > 0
          ? `${result.failedCount} items failed to save`
          : 'All posts saved as drafts and can be edited before publishing'
      })

      // Show errors if any
      if (result.errors && result.errors.length > 0) {
        result.errors.forEach(err => {
          toast.error(`Failed: ${err.title}`, {
            description: err.error
          })
        })
      }

      // Close dialog and refresh
      setShowScheduleDialog(false)
      setGeneratedSchedule([])

      // Optionally reload the page to show new posts
      window.location.reload()
    } catch (error) {
      console.error('[SaveSchedule] Error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save schedule')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container mx-auto max-w-6xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
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
            onClick={handleGenerateSchedule}
            disabled={generating}
            className="gap-2"
          >
            <Calendar className="h-4 w-4" />
            {generating ? 'Generating...' : 'Lên kế hoạch Post'}
          </Button>
          <Button
            onClick={() => setShowCreatePost(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create New Post
          </Button>
        </div>
      </div>

      {/* Posts View (List or Calendar) */}
      <PostsView initialPosts={initialPosts} />

      {/* Create Post Modal */}
      <PostFormModal
        open={showCreatePost}
        onClose={() => setShowCreatePost(false)}
      />

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

      {/* Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Post Schedule - 1 Month Calendar</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {generatedSchedule.length > 0 ? (
              generatedSchedule.map((item, idx) => (
                <div key={idx} className="p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{item.title}</div>
                      <div className="text-sm text-muted-foreground mt-1">{item.idea}</div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground whitespace-nowrap">
                      <div>{item.scheduledDate}</div>
                      <div className="mt-1 capitalize">{item.platform}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">No schedule generated</p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowScheduleDialog(false)}
              disabled={saving}
            >
              Close
            </Button>
            <Button
              onClick={handleSaveSchedule}
              disabled={saving || generatedSchedule.length === 0}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save to Scheduler'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
