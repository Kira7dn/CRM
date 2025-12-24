import type { Post, PostStatus } from '@/core/domain/marketing/post'

/**
 * Post Form Modes
 *
 * Defines the current state/mode of the post form:
 *
 * - **unsaved_draft**: Post exists in store (from AI generation or manual creation)
 *   but NOT saved to database. Identified by `post.id === undefined`.
 *   Example: AI-generated preview posts, user typing in new post form.
 *
 * - **draft**: Post saved to database as draft (all platforms have draft status).
 *   Has real MongoDB ID. Not scheduled, not published.
 *
 * - **scheduled**: Post scheduled for future publishing.
 *   Has `scheduledAt` date in the future, platforms have "scheduled" status.
 *
 * - **published**: At least one platform has successfully published the post.
 *   Platforms have "published" status with external `postId`.
 *
 * - **mixed**: Multiple different statuses across platforms.
 *   Example: Published on Facebook, failed on TikTok.
 */
export type PostFormMode =
  | 'unsaved_draft'  // In store only (no ID), not saved to DB
  | 'draft'          // Saved to DB but not scheduled/published
  | 'scheduled'      // Scheduled for future publishing
  | 'published'      // At least one platform published
  | 'mixed'          // Mixed statuses across platforms

/**
 * Get the overall status of a post based on its platform statuses
 * Priority: published > failed > scheduled > draft
 */
export function getPostStatus(post: Post): PostStatus {
  if (!post.platforms || post.platforms.length === 0) {
    return 'draft'
  }

  // Priority order: published > failed > scheduled > draft
  if (post.platforms.some((p) => p.status === 'published')) return 'published'
  if (post.platforms.some((p) => p.status === 'failed')) return 'failed'
  if (post.platforms.some((p) => p.status === 'scheduled')) return 'scheduled'

  return 'draft'
}

/**
 * Check if a post is a preview (not saved to database)
 *
 * Preview posts are created by:
 * 1. AI generation (from CopilotKit batchDraft handler)
 * 2. User manually creating new post (before first save)
 *
 * Preview posts have NO ID (`post.id === undefined`).
 * Once saved via createPost(), they get a real MongoDB ObjectId.
 *
 * @param post - Post object to check
 * @returns true if post is preview (not saved), false otherwise
 *
 * @example
 * // AI-generated preview
 * const aiPost = { idea: "Post idea", scheduledAt: new Date() }
 * isPreviewPost(aiPost) // true
 *
 * // Saved post
 * const savedPost = { id: "507f1f77bcf86cd799439011", title: "Real Post" }
 * isPreviewPost(savedPost) // false
 */
export function isPreviewPost(post: Post | undefined): boolean {
  if (!post) return false
  return !post.id  // Preview posts have no database ID
}

/**
 * Get the form mode based on post state
 * This determines which actions are available in the form
 */
export function getPostFormMode(post: Post | undefined, isDirty: boolean): PostFormMode {
  // No post object OR preview post (temp-* id or no id) = unsaved draft
  if (!post || isPreviewPost(post)) {
    return 'unsaved_draft'
  }

  // Post has real ID = saved to database, check its status

  // Check if any platform is published
  const hasPublished = post.platforms.some((p) => p.status === 'published')
  if (hasPublished) {
    return 'published'
  }

  // Check if scheduled (only check platform.status, NOT scheduledAt)
  const hasScheduled = post.platforms.some((p) => p.status === 'scheduled')
  if (hasScheduled) {
    return 'scheduled'
  }

  // Check for mixed statuses
  const statuses = new Set(post.platforms.map((p) => p.status))
  if (statuses.size > 1) {
    return 'mixed'
  }

  // All platforms are draft and saved to DB
  return 'draft'
}

/**
 * Determine which actions are available based on form mode
 */
export interface PostFormActions {
  canSaveDraft: boolean
  canSchedule: boolean
  canPublish: boolean
  canDelete: boolean
  primaryActionLabel: string
  saveDraftLabel: string  // Dynamic label for save draft button
}

export function getAvailableActions(
  mode: PostFormMode,
  isDirty: boolean,
  hasScheduledAt: boolean
): PostFormActions {
  switch (mode) {
    case 'unsaved_draft':
      return {
        canSaveDraft: isDirty,
        canSchedule: true,
        canPublish: true,
        canDelete: false,
        primaryActionLabel: hasScheduledAt ? 'Schedule Post' : 'Publish Now',
        saveDraftLabel: 'Save as Draft',
      }

    case 'draft':
      return {
        canSaveDraft: isDirty,
        canSchedule: true,
        canPublish: true,
        canDelete: true,
        primaryActionLabel: hasScheduledAt ? 'Schedule Post' : 'Update Post',
        saveDraftLabel: 'Save as Draft',
      }

    case 'scheduled':
      return {
        canSaveDraft: true,  // Always allow unscheduling
        canSchedule: true,
        canPublish: true,
        canDelete: true,
        primaryActionLabel: 'Update Schedule',
        saveDraftLabel: 'Unschedule & Save as Draft',  // Clear warning label
      }

    case 'published':
      return {
        canSaveDraft: false, // Cannot revert published post to draft
        canSchedule: false,  // Cannot schedule already published
        canPublish: true,    // Can update published post
        canDelete: true,
        primaryActionLabel: 'Update Post',
        saveDraftLabel: 'Save as Draft',  // Not visible anyway
      }

    case 'mixed':
      return {
        canSaveDraft: isDirty && !hasAnyPublished(mode),
        canSchedule: true,
        canPublish: true,
        canDelete: true,
        primaryActionLabel: 'Update Post',
        saveDraftLabel: 'Save as Draft',
      }
  }
}

// Helper to check if mode includes published status
function hasAnyPublished(mode: PostFormMode): boolean {
  return mode === 'published' || mode === 'mixed'
}
