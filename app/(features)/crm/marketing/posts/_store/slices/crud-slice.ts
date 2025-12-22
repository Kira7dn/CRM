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
  updatePost: (postId: string, payload: PostPayload) => Promise<{ success: boolean }>
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

      // Remove from preview if it was a temp post
      if (payload.id?.startsWith("temp")) {
        get().removePreviewPost(payload.id)
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

        toast({
          title: "Post updated successfully",
          description: `Changes to "${result.post?.title}" have been saved`,
        })
      } else {
        toast({
          title: "Update failed",
          description: "Failed to update post",
          variant: "destructive",
        })
      }

      return result
    } catch (error) {
      console.error("[PostStore] Failed to update post:", error)
      const message = error instanceof Error ? error.message : "Failed to update post"
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
