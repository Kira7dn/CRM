"use client"

import { ReactNode, useLayoutEffect, useRef, createRef } from "react"
import { GridStack, GridStackWidget } from "gridstack"

import { Card, CardContent, CardHeader, CardTitle } from "@shared/ui/card"
import { WidgetModule } from "./CustomizableDashboard"

export interface Widget {
  id: string
  title: string | ReactNode
  component: ReactNode
  visible: boolean
  module: WidgetModule
  x?: number
  y?: number
  w?: number
  h?: number
  minW?: number
  minH?: number
}

interface ModuleGridProps {
  module: WidgetModule
  items: Widget[]
  editMode: boolean
  onLayoutChange: (items: Widget[]) => void
}

// Individual Grid per Module (based on official React example)
export function ModuleGrid({ module, items, editMode, onLayoutChange }: ModuleGridProps) {
  const refs = useRef<Record<string, React.RefObject<HTMLDivElement>>>({})
  const gridRef = useRef<GridStack | null>(null)
  const gridContainerRef = useRef<HTMLDivElement>(null)
  const onLayoutChangeRef = useRef(onLayoutChange)
  const editModeRef = useRef(editMode)
  const itemsRef = useRef(items)

  // Keep refs updated
  useLayoutEffect(() => {
    onLayoutChangeRef.current = onLayoutChange
    editModeRef.current = editMode
    itemsRef.current = items
  }, [onLayoutChange, editMode, items])

  // Create refs for each widget
  refs.current = {}
  items.forEach(({ id }) => {
    refs.current[id] = refs.current[id] || createRef<HTMLDivElement>()
  })

  useLayoutEffect(() => {
    if (!gridRef.current && gridContainerRef.current) {
      // Initialize GridStack ONCE
      const grid = gridRef.current = GridStack.init(
        {
          column: 12,
          cellHeight: 80,
          acceptWidgets: false,
          // float: true,
          removable: false,
          lazyLoad: true,
          staticGrid: !editMode, // Set initial static state
        },
        gridContainerRef.current
      )

      // Register change event
      grid.on('change', () => {
        // Use ref to get current editMode value
        if (!editModeRef.current) return

        // Save layout changes using ID matching
        const serialized = grid.save(false) as GridStackWidget[]
        const currentItems = itemsRef.current
        const newItems = currentItems.map((item) => {
          const updated = serialized.find((s) => s.id === item.id)
          if (updated) {
            return {
              ...item,
              x: updated.x ?? item.x,
              y: updated.y ?? item.y,
              w: updated.w ?? item.w,
              h: updated.h ?? item.h,
            }
          }
          return item
        })
        onLayoutChangeRef.current(newItems)
      })

      // Initial load of items
      const layout = items.map((item) => ({
        id: item.id,
        x: item.x ?? 0,
        y: item.y ?? 0,
        w: item.w ?? 3,
        h: item.h ?? 3,
        minW: item.minW ?? 2,
        minH: item.minH ?? 2,
      }))
      grid.load(layout as GridStackWidget[])
    }
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update drag/resize when editMode changes
  useLayoutEffect(() => {
    if (gridRef.current) {
      gridRef.current.setStatic(!editMode)
    }
  }, [editMode])

  return (
    <div className="grid-stack" ref={gridContainerRef}>
      {items.map((widget) => (
        <div
          ref={refs.current[widget.id]}
          key={widget.id}
          className="grid-stack-item"
          gs-id={widget.id}
          gs-x={widget.x ?? 0}
          gs-y={widget.y ?? 0}
          gs-w={widget.w ?? 3}
          gs-h={widget.h ?? 3}
          gs-min-w={widget.minW ?? 2}
          gs-min-h={widget.minH ?? 2}
        >
          <Card className="grid-stack-item-content p-2 py-4 gap-2 hover:shadow-lg transition-all hover:-translate-y-0.5">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                {widget.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 overflow-y-scroll scrollbar-hidden">
              {widget.component}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  )
}
