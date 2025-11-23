import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { Widget } from "../GridStackDashboard"

const STORAGE_KEY = "dashboard-layout"

interface DashboardState {
    widgets: Widget[]
    defaultWidgets: Widget[]

    setDefaultWidgets: (widgets: Widget[]) => void
    setWidgets: (widgets: Widget[]) => void

    saveWidgets: (widgets: Widget[]) => void
    resetWidgets: () => void
}

// 🔥 Persist chỉ lưu layout widget, không lưu defaultWidgets
export const useDashboardStore = create<DashboardState>()(
    persist(
        (set, get) => ({
            widgets: [],
            defaultWidgets: [],

            setDefaultWidgets: (defaultWidgets) => {
                set({ defaultWidgets })
                // Nếu chưa khởi tạo widgets thì load từ storage (persist restore)
                if (get().widgets.length === 0) {
                    const { widgets, defaultWidgets } = get()
                    if (defaultWidgets.length > 0 && widgets.length > 0) {
                        set({ widgets: mergeWithDefaults(defaultWidgets, widgets) })
                    } else {
                        set({ widgets: defaultWidgets })
                    }
                }
            },

            setWidgets: (widgets) => set({ widgets }),

            saveWidgets: (widgets) => set({ widgets }),

            resetWidgets: () => set({ widgets: get().defaultWidgets }),
        }),
        {
            name: STORAGE_KEY,
            storage: createJSONStorage(() => localStorage),

            // Chỉ persist layout cần thiết
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
            }),
        }
    )
)

// 🔄 Merge saved layout with default widgets
function mergeWithDefaults(defaultWidgets: Widget[], saved: Widget[]): Widget[] {
    return defaultWidgets.map((defaultWidget) => {
        const savedWidget = saved.find((w) => w.id === defaultWidget.id)
        return savedWidget
            ? { ...defaultWidget, ...savedWidget }
            : defaultWidget
    })
}