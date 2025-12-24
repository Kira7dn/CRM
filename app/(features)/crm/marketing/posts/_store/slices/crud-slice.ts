import type { StateCreator } from "zustand"
import type { Post } from "@/core/domain/marketing/post"
import type { PostPayload } from "@/core/application/interfaces/marketing/post-repo"
import { toast } from "@shared/hooks/use-toast"
import type { PostStore } from "../types"

/**
 * CRUD Slice
 * Manages create, update, delete operations for posts
 */
export interface CrudSlice {
  createPost: (payload: PostPayload) => Promise<{ success: boolean; post: Post }>
  updatePost: (postId: string, payload: PostPayload) => Promise<{ success: boolean; post: Post | null }>
  deletePost: (postId: string) => Promise<void>
}

export const createCrudSlice: StateCreator<
  PostStore,
  [],
  [],
  CrudSlice
> = (set, get) => ({
  // ===== CREATE =====
  createPost: async (payload: PostPayload) => {
    try {
      const { createPostAction } = await import("../../_actions/create-post-action")

      const result = await createPostAction({ payload })

      // Update posts list
      get().setPosts([...get().posts, result.post])

      // Clean up preview post from previewPosts array if it was one
      // Preview posts are identified by matching idea or scheduledAt
      const { previewPosts } = get()
      if (previewPosts.length > 0) {
        // Find and remove matching preview (by idea + scheduledAt match)
        const matchingPreview = previewPosts.find(
          p => p.idea === payload.idea &&
               String(p.scheduledAt) === String(payload.scheduledAt)
        )
        if (matchingPreview) {
          get().setPreviewPosts(
            previewPosts.filter(p => p !== matchingPreview)
          )
        }
      }

      // Close all modals on successful create
      get().closeAllModals()

      toast({
        title: "Post created successfully",
        description: `Post "${result.post.title}" has been created`,
      })

      return result
    } catch (error) {
      console.error("[PostStore] Failed to create post:", error)
      const message = error instanceof Error ? error.message : "Failed to create post"
      toast({
        title: "Create failed",
        description: message,
        variant: "destructive",
      })
      throw error
    }
  },

  // ===== UPDATE =====
  updatePost: async (postId: string, payload: PostPayload) => {
    try {
      const { updatePostAction } = await import("../../_actions/update-post-action")

      const result = await updatePostAction({ postId, payload })

      if (result.success && result.post) {
        // Update posts list
        get().setPosts(get().posts.map(p => p.id === postId ? result.post! : p))

        // Close all modals on successful update
        get().closeAllModals()

        // Show success with optional warning for platform errors
        toast({
          title: "Post updated successfully",
          description: result.error
            ? `Changes saved. Warning: ${result.error}`
            : `Changes to "${result.post.title}" have been saved`,
          variant: result.error ? "default" : "default",
        })
      } else {
        // Show specific error message from server
        const errorMessage = result.error || "Failed to update post. Please try again."

        toast({
          title: "Update failed",
          description: errorMessage,
          variant: "destructive",
        })
      }

      return result
    } catch (error) {
      console.error("[PostStore] Failed to update post:", error)
      const message = error instanceof Error ? error.message : "An unexpected error occurred while updating the post"
      toast({
        title: "Update failed",
        description: message,
        variant: "destructive",
      })
      throw error
    }
  },

  // ===== DELETE =====
  deletePost: async (postId: string) => {
    try {
      const { deletePostAction } = await import("../../_actions/delete-post-action")

      await deletePostAction(postId)

      // Remove from local state
      set((state) => ({
        posts: state.posts.filter((p) => p.id !== postId),
      }))

      toast({
        title: "Post deleted successfully",
      })
    } catch (error) {
      console.error("[PostStore] Failed to delete post:", error)
      const message = error instanceof Error ? error.message : "Failed to delete post"
      toast({
        title: "Delete failed",
        description: message,
        variant: "destructive",
      })
      throw error
    }
  },
})
