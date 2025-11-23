"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@shared/ui/button"
import { Settings, Save, X, ChevronUp, ChevronDown } from "lucide-react"
import { ModuleGrid, Widget } from "./ModuleGrid"
import { useDashboardStore, type WidgetModule } from "../hooks/useDashboardStore"
import { SidebarProvider, SidebarInset } from "@shared/ui/sidebar"
import DashboardSideBar from "./DashboardSideBar"

// Re-export WidgetModule for other components
export type { WidgetModule } from "../hooks/useDashboardStore"

interface CustomizableDashboardClientProps {
  widgets: Widget[]
}

export const MODULE_NAMES: Record<WidgetModule, string> = {
  finance: "💰 Tài chính",
  customer: "👥 Khách hàng",
  order: "📦 Đơn hàng",
  product: "🏷️ Sản phẩm",
  risk: "⚠️ Rủi ro",
  forecast: "📈 Dự báo",
  inventory: "📦 Tồn kho"
}

export function CustomizableDashboard({ widgets: initialWidgets }: CustomizableDashboardClientProps) {
  const [editMode, setEditMode] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Store selectors
  const widgets = useDashboardStore((s) => s.widgets)
  const moduleOrder = useDashboardStore((s) => s.moduleOrder)
  const setDefaultWidgets = useDashboardStore((s) => s.setDefaultWidgets)
  const saveWidgets = useDashboardStore((s) => s.saveWidgets)
  const resetWidgets = useDashboardStore((s) => s.resetWidgets)
  const toggleWidgetVisibility = useDashboardStore((s) => s.toggleWidgetVisibility)
  const updateWidgetLayout = useDashboardStore((s) => s.updateWidgetLayout)
  const moveModuleUp = useDashboardStore((s) => s.moveModuleUp)
  const moveModuleDown = useDashboardStore((s) => s.moveModuleDown)

  // Khởi tạo effect để mount component
  useEffect(() => {
    if (!mounted) {
      setMounted(true)
      setDefaultWidgets(initialWidgets)
    }
  }, [initialWidgets, setDefaultWidgets, mounted])

  // Save layout
  const handleSaveLayout = () => {
    saveWidgets(widgets)
    setEditMode(false)
  }

  // Cancel edit mode
  const handleCancelEdit = () => {
    resetWidgets()
    setEditMode(false)
  }

  // Toggle widget visibility (only in edit mode)
  const handleToggleVisibility = (id: string) => {
    if (editMode) {
      toggleWidgetVisibility(id)
    }
  }

  // Group widgets by module
  const groupedWidgets = useMemo(() => {
    return widgets.reduce<Record<WidgetModule, Widget[]>>((acc, widget) => {
      const module = widget.module as WidgetModule
      if (!acc[module]) {
        acc[module] = []
      }
      acc[module].push(widget)
      return acc
    }, {} as Record<WidgetModule, Widget[]>)
  }, [widgets])

  // Loading state
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
      <SidebarProvider>
        <div className="flex w-full">
          {/* Sidebar - Only visible in edit mode */}
          {editMode && (
            <DashboardSideBar
              widgets={widgets}
              moduleOrder={moduleOrder}
              handleToggleVisibility={handleToggleVisibility}
            />
          )}

          {/* Main Dashboard */}
          <SidebarInset className={editMode ? "" : "ml-0"}>
            <div className="flex-1 min-w-0 w-full">
              {editMode && (
                <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    💡 Kéo thả và thay đổi kích thước các widget trong từng khu vực module tương ứng
                  </p>
                </div>
              )}

              <div className="space-y-6 pr-2">
                {moduleOrder.map((module, moduleIndex) => {
                  const moduleWidgets = groupedWidgets[module]?.filter((w) => w.visible) || []
                  if (moduleWidgets.length === 0) return null

                  const isFirst = moduleIndex === 0
                  const isLast = moduleIndex === moduleOrder.length - 1

                  return (
                    <div key={module} className="space-y-3">
                      <div className="flex items-center justify-between px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                            {MODULE_NAMES[module]}
                          </h3>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({moduleWidgets.length} widget{moduleWidgets.length > 1 ? 's' : ''})
                          </span>
                        </div>
                        {editMode && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveModuleUp(module)}
                              disabled={isFirst}
                              className="h-7 w-7 p-0"
                              title="Di chuyển lên"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveModuleDown(module)}
                              disabled={isLast}
                              className="h-7 w-7 p-0"
                              title="Di chuyển xuống"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>

                      <ModuleGrid
                        module={module}
                        items={moduleWidgets}
                        editMode={editMode}
                        onLayoutChange={(items) => updateWidgetLayout(module, items)}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
