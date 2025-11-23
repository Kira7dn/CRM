import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarHeader,
    SidebarInput,
} from "@shared/ui/sidebar"
import { Label } from "@/@shared/ui/label"
import { ChevronRight, Eye, EyeOff, Search } from "lucide-react"
import { useMemo, useState } from "react"
import { MODULE_NAMES, WidgetModule } from "./CustomizableDashboard"
import { Widget } from "./ModuleGrid"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/@shared/ui/collapsible"

type Props = {
    widgets: Widget[]
    moduleOrder: WidgetModule[]
    handleToggleVisibility: (id: string) => void
}
// Vietnamese accent removal utility
function removeVietnameseAccents(str: string): string {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
}

function DashboardSideBar({ widgets, moduleOrder, handleToggleVisibility }: Props) {
    const [searchQuery, setSearchQuery] = useState("")
    // Group widgets by module with Vietnamese-aware search filter
    const groupedWidgets = useMemo(() => {
        const filtered = searchQuery
            ? widgets.filter((widget) => {
                // Chỉ xử lý nếu title là string
                if (typeof widget.title !== 'string') return false

                const widgetTitleLower = widget.title.toLowerCase()
                const widgetTitleNoAccent = removeVietnameseAccents(widgetTitleLower)
                const queryLower = searchQuery.toLowerCase()
                const queryNoAccent = removeVietnameseAccents(queryLower)

                // Match with or without accents
                return (
                    widgetTitleLower.includes(queryLower) ||
                    widgetTitleNoAccent.includes(queryNoAccent)
                )
            })
            : widgets

        return filtered.reduce<Record<WidgetModule, Widget[]>>((acc, widget) => {
            const module = widget.module as WidgetModule
            if (!acc[module]) {
                acc[module] = []
            }
            acc[module].push(widget)
            return acc
        }, {} as Record<WidgetModule, Widget[]>)
    }, [widgets, searchQuery])
    return (
        <Sidebar side="left" collapsible="none" className="sticky top-4 h-screen">
            <SidebarHeader className="border-b">
                <div className="flex flex-col gap-2">
                    <div className="px-2">
                        <h3 className="text-sm font-semibold">Widget Settings</h3>
                        <p className="text-xs text-muted-foreground">Toggle widget visibility</p>
                    </div>
                    <form onSubmit={(e) => e.preventDefault()}>
                        <SidebarGroup className="py-0">
                            <SidebarGroupContent className="relative">
                                <Label htmlFor="search" className="sr-only">
                                    Search
                                </Label>
                                <SidebarInput
                                    id="search"
                                    placeholder="Search widgets..."
                                    className="pl-8"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </form>
                </div>
            </SidebarHeader>
            <SidebarContent className="gap-0 overflow-y-auto">
                {moduleOrder.map((module) => (
                    <Collapsible
                        key={module}
                        title={MODULE_NAMES[module]}
                        defaultOpen
                        className="group/collapsible"
                    >
                        <SidebarGroup>
                            <SidebarGroupLabel
                                asChild
                                className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm"
                            >
                                <CollapsibleTrigger
                                    className="w-full flex items-center font-semibold"
                                >
                                    <span className="flex-1 text-left">{MODULE_NAMES[module]}</span>
                                    <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                                </CollapsibleTrigger>
                            </SidebarGroupLabel>
                            <CollapsibleContent>
                                <SidebarGroupContent>
                                    <SidebarMenu>
                                        {groupedWidgets[module]?.map((widget) => (
                                            <SidebarMenuItem key={widget.id}>
                                                <SidebarMenuButton
                                                    onClick={() => handleToggleVisibility(widget.id)}
                                                    className={`w-full justify-between ${widget.visible ? "" : "opacity-50"}`}
                                                    isActive={widget.visible}
                                                >
                                                    <span className="flex-1 truncate text-xs">{widget.title}</span>
                                                    {widget.visible ?
                                                        "➕"
                                                        : "➖"}
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ))}
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </CollapsibleContent>
                        </SidebarGroup>
                    </Collapsible>
                ))}
            </SidebarContent>
        </Sidebar>
    )
}

export default DashboardSideBar