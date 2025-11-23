"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@shared/ui/button"
import { Settings, Save, X } from "lucide-react"
import { GridStackDashboard, Widget } from "./GridStackDashboard"
import { useDashboardStore } from "./hooks/useDashboardStore"

interface CustomizableDashboardClientProps {
  widgets: Widget[]
}

export function CustomizableDashboardClient({ widgets: initialWidgets }: CustomizableDashboardClientProps) {
  const [editMode, setEditMode] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Truy cập Zustand store thông qua selector
  const widgets = useDashboardStore((s) => s.widgets)
  const saveWidgets = useDashboardStore((s) => s.saveWidgets)
  const resetWidgets = useDashboardStore((s) => s.resetWidgets)
  const setDefaultWidgets = useDashboardStore((s) => s.setDefaultWidgets)

  // Set defaultWidgets sau khi mount để tránh SSR mismatch
  useEffect(() => {
    setMounted(true)
    setDefaultWidgets(initialWidgets)
  }, [initialWidgets, setDefaultWidgets])

  // **Chỉ cập nhật state tạm**, không lưu vào localStorage
  const handleLayoutChange = useCallback(
    (newWidgets: Widget[]) => {
      if (editMode) {
        saveWidgets(newWidgets)
      }
    },
    [editMode, saveWidgets]
  )

  // **Lưu thật sự vào persist storage**
  const handleSaveLayout = () => {
    saveWidgets(widgets)
    setEditMode(false)
  }

  // **Khôi phục layout từ storage (persist)**
  const handleCancelEdit = () => {
    resetWidgets()
    setEditMode(false)
  }

  if (!mounted) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Dashboard</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-500">Loading dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Dashboard</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {editMode ? "Đang chỉnh sửa layout" : "Tùy chỉnh dashboard của bạn"}
          </p>
        </div>

        <div className="flex gap-2">
          {editMode ? (
            <>
              <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                <X className="w-4 h-4 mr-2" /> Hủy
              </Button>
              <Button size="sm" onClick={handleSaveLayout}>
                <Save className="w-4 h-4 mr-2" /> Lưu
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
              <Settings className="w-4 h-4 mr-2" /> Tùy chỉnh
            </Button>
          )}
        </div>
      </div>

      {/* Dashboard */}
      <GridStackDashboard
        widgets={widgets}
        onLayoutChange={handleLayoutChange}
        editMode={editMode}
      />
    </div>
  )
}
