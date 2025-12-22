# Post Store Architecture

## Overview

The Post Store has been refactored into a modular architecture using Zustand slices for better code organization and maintainability.

## Structure

```
_store/
├── README.md                 # This file
├── types.ts                  # TypeScript interfaces & types
├── usePostStore.ts          # Main store (combines all slices)
├── usePostStore.old.ts      # Backup of old monolithic store
└── slices/
    ├── modal-slice.ts       # Modal state management
    ├── data-slice.ts        # Posts data & loading
    ├── crud-slice.ts        # Create, Update, Delete operations
    └── planner-slice.ts     # AI schedule generation & batch saving
```

## Files

### `types.ts`
Defines all TypeScript interfaces:
- `PostStoreState` - All state properties
- `PostStoreActions` - All action methods
- `PostStore` - Complete store type (State + Actions)

### `slices/modal-slice.ts` (67 lines)
Manages modal state and actions:
- **State**: `isPostFormModalOpen`, `isDayScheduleDialogOpen`, `selectedPost`, `selectedDate`
- **Actions**: `openPostFormModal()`, `closePostFormModal()`, `openDayScheduleDialog()`, `closeDayScheduleDialog()`, `closeAllModals()`

### `slices/data-slice.ts` (149 lines)
Manages posts data and loading:
- **State**: `posts`, `filter`, `previewPosts`, `isLoading`, `hasLoaded`, `loadedMonths`
- **Actions**: `setPosts()`, `setFilter()`, `loadPosts()`, `loadPostsByMonth()`, `findPostById()`, `setPreviewPosts()`, `clearPreviewPosts()`, `removePreviewPost()`

### `slices/crud-slice.ts` (121 lines)
Handles CRUD operations with automatic modal closing:
- **Actions**: `createPost()`, `updatePost()`, `deletePost()`
- **Features**: Toast notifications, automatic modal closing on success

### `slices/planner-slice.ts` (258 lines)
Manages AI-powered schedule generation:
- **State**: `isGeneratingSchedule`, `isSavingSchedule`, `saveProgress`
- **Actions**: `generateSchedule()`, `savePlannerPosts()`, `undoSchedule()`
- **Features**: Streaming API for batch save with real-time progress

### `usePostStore.ts` (23 lines)
Main store that combines all slices using Zustand's spread operator pattern.

## Benefits

### Before Refactoring
- ❌ **546 lines** in single file
- ❌ Hard to navigate and find specific logic
- ❌ Difficult to understand responsibilities
- ❌ Merge conflicts when multiple people edit

### After Refactoring
- ✅ **Modular**: Each slice is **~70-260 lines**
- ✅ **Organized**: Clear separation of concerns
- ✅ **Maintainable**: Easy to find and modify specific logic
- ✅ **Scalable**: Add new slices without touching existing code
- ✅ **Type-safe**: Centralized type definitions

## Usage

Import remains the same:

```typescript
import { usePostStore } from '../_store/usePostStore'

function MyComponent() {
  // Access any part of the store
  const { posts, createPost, openPostFormModal } = usePostStore()

  // Or select specific parts
  const posts = usePostStore(state => state.posts)
  const createPost = usePostStore(state => state.createPost)
}
```

## Adding New Features

### 1. Add to existing slice
Edit the appropriate slice file (e.g., `modal-slice.ts`)

### 2. Create new slice
1. Create `slices/my-slice.ts`
2. Define interface and create function
3. Add to `types.ts`
4. Combine in `usePostStore.ts`

Example:
```typescript
// slices/analytics-slice.ts
export interface AnalyticsSlice {
  stats: PostStats | null
  loadStats: () => Promise<void>
}

export const createAnalyticsSlice: StateCreator<PostStore, [], [], AnalyticsSlice> = (set) => ({
  stats: null,
  loadStats: async () => { /* ... */ }
})

// usePostStore.ts
export const usePostStore = create<PostStore>()((...a) => ({
  ...createModalSlice(...a),
  ...createDataSlice(...a),
  ...createCrudSlice(...a),
  ...createPlannerSlice(...a),
  ...createAnalyticsSlice(...a), // Add new slice
}))
```

## Best Practices

1. **Keep slices focused**: Each slice should handle one concern
2. **Use meaningful names**: `createPost()` not `create()`
3. **Handle errors**: Always try/catch with toast notifications
4. **Type everything**: Use TypeScript interfaces from `types.ts`
5. **Document complex logic**: Add comments for non-obvious code

## Migration Notes

The old monolithic store is backed up as `usePostStore.old.ts`. If you need to reference the old implementation, it's still available.

All functionality remains identical - only the internal structure has changed.
