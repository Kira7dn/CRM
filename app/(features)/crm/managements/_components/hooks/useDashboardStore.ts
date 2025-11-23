import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { Widget } from "../dashboard/ModuleGrid"

export type WidgetModule = "finance" | "customer" | "order" | "product" | "risk" | "forecast" | "inventory"

const STORAGE_KEY = "dashboard-layout"
const MODULE_ORDER_KEY = "dashboard-module-order"

const DEFAULT_MODULE_ORDER: WidgetModule[] = [
    "finance",
    "customer",
    "order",
    "product",
    "risk",
    "forecast",
    "inventory",
]

interface DashboardState {
    widgets: Widget[]
    defaultWidgets: Widget[]
    moduleOrder: WidgetModule[]

    setDefaultWidgets: (widgets: Widget[]) => void
    saveWidgets: (widgets: Widget[]) => void
    resetWidgets: () => void
    toggleWidgetVisibility: (id: string) => void
    updateWidgetLayout: (module: WidgetModule, updatedItems: Widget[]) => void

    setModuleOrder: (order: WidgetModule[]) => void
    moveModuleUp: (module: WidgetModule) => void
    moveModuleDown: (module: WidgetModule) => void
}

export const useDashboardStore = create<DashboardState>()(
    persist(
        (set, get) => ({
            widgets: [],
            defaultWidgets: [],
            moduleOrder: DEFAULT_MODULE_ORDER,

            setDefaultWidgets: (defaultWidgets) => {
                const currentWidgets = get().widgets
                set({ defaultWidgets })

                if (currentWidgets.length > 0) {
                    const merged = mergeWithDefaults(defaultWidgets, currentWidgets)
                    set({ widgets: merged })
                } else {
                    set({ widgets: defaultWidgets })
                }
            },

            saveWidgets: (widgets) => set({ widgets }),

            resetWidgets: () => set({ widgets: get().defaultWidgets }),

            toggleWidgetVisibility: (id) => {
                const widgets = get().widgets.map((widget) =>
                    widget.id === id ? { ...widget, visible: !widget.visible } : widget
                )
                set({ widgets })
            },

            updateWidgetLayout: (module, updatedItems) => {
                const currentWidgets = get().widgets
                let hasChanges = false

                const widgets = currentWidgets.map((widget) => {
                    if (widget.module !== module) return widget
                    const updated = updatedItems.find((item) => item.id === widget.id)
                    if (updated) {
                        // Check if any layout property actually changed
                        const hasLayoutChange =
                            widget.x !== updated.x ||
                            widget.y !== updated.y ||
                            widget.w !== updated.w ||
                            widget.h !== updated.h

                        if (hasLayoutChange) {
                            hasChanges = true
                            return { ...widget, ...updated }
                        }
                    }
                    return widget
                })

                // Only update state if there were actual changes
                if (hasChanges) {
                    set({ widgets })
                }
            },

            setModuleOrder: (moduleOrder) => {
                set({ moduleOrder })
                localStorage.setItem(MODULE_ORDER_KEY, JSON.stringify(moduleOrder))
            },

            moveModuleUp: (module) => {
                const { moduleOrder, setModuleOrder } = get()
                const currentIndex = moduleOrder.indexOf(module)
                if (currentIndex > 0) {
                    const newOrder = [...moduleOrder]
                        ;[newOrder[currentIndex], newOrder[currentIndex - 1]] = [
                            newOrder[currentIndex - 1],
                            newOrder[currentIndex],
                        ]
                    setModuleOrder(newOrder)
                }
            },

            moveModuleDown: (module) => {
                const { moduleOrder, setModuleOrder } = get()
                const currentIndex = moduleOrder.indexOf(module)
                if (currentIndex < moduleOrder.length - 1) {
                    const newOrder = [...moduleOrder]
                        ;[newOrder[currentIndex], newOrder[currentIndex + 1]] = [
                            newOrder[currentIndex + 1],
                            newOrder[currentIndex],
                        ]
                    setModuleOrder(newOrder)
                }
            }
        }),
        {
            name: STORAGE_KEY,
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                widgets: state.widgets.map((w) => ({
                    id: w.id,
                    module: w.module,
                    visible: w.visible,
                    x: w.x,
                    y: w.y,
                    w: w.w,
                    h: w.h,
                })),
                moduleOrder: state.moduleOrder,
            }),
        }
    )
)

function mergeWithDefaults(defaultWidgets: Widget[], saved: Widget[]): Widget[] {
    return defaultWidgets.map((defaultWidget) => {
        const savedWidget = saved.find((w) => w.id === defaultWidget.id)
        if (savedWidget) {
            return {
                ...defaultWidget,
                x: savedWidget.x ?? defaultWidget.x ?? 0,
                y: savedWidget.y ?? defaultWidget.y ?? 0,
                w: savedWidget.w ?? defaultWidget.w,
                h: savedWidget.h ?? defaultWidget.h,
                visible: savedWidget.visible ?? defaultWidget.visible,
            }
        }
        return defaultWidget
    })
}