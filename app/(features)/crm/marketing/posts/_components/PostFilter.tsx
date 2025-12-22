'use client'

import { usePostStore } from '../_store/usePostStore'

export default function PostFilter() {
  const { filter, setFilter } = usePostStore()

  return (
    <input
      type="text"
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
      placeholder="Search posts..."
      className="px-2 py-1 rounded w-full"
    />
  )
}
