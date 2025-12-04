import { useEffect } from 'react'

/**
 * Hook to periodically check and update scheduled posts
 * Calls API endpoint to update scheduled posts to published
 */
export function useScheduledPostUpdater() {
  useEffect(() => {
    const updateScheduledPosts = async () => {
      try {
        const response = await fetch('/api/posts/update-scheduled-status', {
          method: 'POST',
        })

        if (response.ok) {
          const data = await response.json()
          if (data.updatedCount > 0) {
            console.log(`[ScheduledPostUpdater] Updated ${data.updatedCount} posts to published`)
            // Optionally trigger a refresh
            window.location.reload()
          }
        }
      } catch (error) {
        console.error('[ScheduledPostUpdater] Failed to update:', error)
      }
    }

    // Run immediately on mount
    updateScheduledPosts()

    // Then run every 5 minutes
    const interval = setInterval(updateScheduledPosts, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])
}
