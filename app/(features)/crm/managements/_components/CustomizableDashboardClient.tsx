"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@shared/ui/button"
import { Settings, Save, X } from "lucide-react"
import { GridStackDashboard, Widget } from "./GridStackDashboard"

interface CustomizableDashboardClientProps {
  widgets: Widget[]
}

export function CustomizableDashboardClient({ widgets: initialWidgets }: CustomizableDashboardClientProps) {
  const [editMode, setEditMode] = useState(false)
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [mounted, setMounted] = useState(false)

  // Load widgets from localStorage
  const loadWidgetsFromStorage = useCallback(() => {
    try {
      const savedLayout = localStorage.getItem("dashboard-layout")

      if (!savedLayout) {
        setWidgets(initialWidgets)
        return
      }

      const parsed = JSON.parse(savedLayout)

      // Validate parsed data
      if (!Array.isArray(parsed)) {
        console.warn("Invalid dashboard layout format, using default")
        setWidgets(initialWidgets)
        return
      }

      // Merge saved layout with initial widgets to preserve components
      const mergedWidgets = initialWidgets.map((widget) => {
        const saved = parsed.find((w: Widget) => w.id === widget.id)
        return saved
          ? {
            ...widget,
            visible: saved.visible ?? true,
            x: saved.x,
            y: saved.y,
            w: saved.w,
            h: saved.h,
          }
          : widget
      })

      // Reorder based on saved order
      const orderedWidgets = parsed
        .map((saved: Widget) =>
          mergedWidgets.find((w) => w.id === saved.id)
        )
        .filter((w): w is Widget => w !== undefined)

      // Add any new widgets that weren't in saved layout
      const newWidgets = mergedWidgets.filter(
        (w) => !parsed.find((saved: Widget) => saved.id === w.id)
      )

      setWidgets([...orderedWidgets, ...newWidgets])
    } catch (error) {
      console.error("Failed to load dashboard layout:", error)
      setWidgets(initialWidgets)
    }
  }, [initialWidgets])

  // Load widgets from localStorage on mount (client-only)
  useEffect(() => {
    loadWidgetsFromStorage()
    setMounted(true)
  }, [loadWidgetsFromStorage])

  // Listen for storage events (from Copilot widget management)
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('[Dashboard] Widgets updated by Copilot, reloading...')
      loadWidgetsFromStorage()
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [loadWidgetsFromStorage])

  const handleLayoutChange = useCallback((newWidgets: Widget[]) => {
    setWidgets(prevWidgets => {
      // Create simplified versions of the widgets for comparison
      const simplifyWidget = (w: Widget) => ({
        id: w.id,
        visible: w.visible,
        module: w.module,
        x: w.x,
        y: w.y,
        w: w.w,
        h: w.h,
      });

      const prevSimple = prevWidgets.map(simplifyWidget);
      const newSimple = newWidgets.map(simplifyWidget);

      // Compare the simplified versions
      const hasChanged = JSON.stringify(prevSimple) !== JSON.stringify(newSimple);
      return hasChanged ? newWidgets : prevWidgets;
    });
  }, [])

  const handleSaveLayout = () => {
    try {
      const layoutData = widgets.map((w) => ({
        id: w.id,
        visible: w.visible,
        module: w.module,
        x: w.x,
        y: w.y,
        w: w.w,
        h: w.h,
      }))
      localStorage.setItem("dashboard-layout", JSON.stringify(layoutData))
      setEditMode(false)
    } catch (error) {
      console.error("Failed to save dashboard layout:", error)
      alert("Không thể lưu cấu hình dashboard. Vui lòng thử lại.")
    }
  }

  const handleCancelEdit = () => {
    setEditMode(false)

    try {
      // Reload from localStorage to discard changes
      const savedLayout = localStorage.getItem("dashboard-layout")
      if (!savedLayout) {
        setWidgets(initialWidgets)
        return
      }

      const parsed = JSON.parse(savedLayout)

      // Validate parsed data
      if (!Array.isArray(parsed)) {
        setWidgets(initialWidgets)
        return
      }

      const mergedWidgets = initialWidgets.map((widget) => {
        const saved = parsed.find((w: Widget) => w.id === widget.id)
        return saved
          ? {
            ...widget,
            visible: saved.visible ?? true,
            x: saved.x,
            y: saved.y,
            w: saved.w,
            h: saved.h,
          }
          : widget
      })

      const orderedWidgets = parsed
        .map((saved: Widget) =>
          mergedWidgets.find((w) => w.id === saved.id)
        )
        .filter((w): w is Widget => w !== undefined)

      const newWidgets = mergedWidgets.filter(
        (w) => !parsed.find((saved: Widget) => saved.id === w.id)
      )

      setWidgets([...orderedWidgets, ...newWidgets])
    } catch (error) {
      console.error("Failed to reload dashboard layout:", error)
      setWidgets(initialWidgets)
    }
  }

  // Show loading state until mounted
  if (!mounted) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Dashboard
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Loading...
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-500">Loading dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Dashboard
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {editMode ? "Đang chỉnh sửa layout" : "Tùy chỉnh dashboard của bạn"}
          </p>
        </div>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
              >
                <X className="w-4 h-4 mr-2" />
                Hủy
              </Button>
              <Button
                size="sm"
                onClick={handleSaveLayout}
              >
                <Save className="w-4 h-4 mr-2" />
                Lưu
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditMode(true)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Tùy chỉnh
            </Button>
          )}
        </div>
      </div>

      <GridStackDashboard
        widgets={widgets}
        onLayoutChange={handleLayoutChange}
        editMode={editMode}
      />
    </div>
  )
}
