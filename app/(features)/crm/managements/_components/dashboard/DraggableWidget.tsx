"use client"

import { ReactNode } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/@shared/ui/card"
import { WidgetModule } from "./CustomizableDashboard"

interface DraggableWidgetProps {
  id: string
  title: string | ReactNode
  children: ReactNode
  disabled?: boolean
  module?: WidgetModule
  colSpan?: number
  rowSpan?: number
}

export function DraggableWidget({
  id,
  title,
  children,
  disabled = false,
  colSpan = 1,
  rowSpan = 1,
}: DraggableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled })
  const defaultRowHeight = 240
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    gridColumn: `span ${colSpan}`,
    height: `${rowSpan * defaultRowHeight}px`,
  }

  return (
    <Card ref={setNodeRef}
      style={style} className={`
        relative ${isDragging ? "z-50 ring-2 ring-blue-400 rounded-lg" : ""} 
        border-green-200 dark:border-green-800 gap-2 py-4 hover:shadow-lg 
        transition-all hover:-translate-y-0.5
      `}
    >
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          {title}
          {!disabled && (
            <div
              {...attributes}
              {...listeners}
              className="absolute top-2 right-2 z-10 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md cursor-grab active:cursor-grabbing hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-none"
              aria-label={`Drag ${title}`}
              role="button"
              tabIndex={0}
            >
              <GripVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 overflow-y-scroll scrollbar-hidden">
        {children}
      </CardContent>
    </Card>
  )
}
