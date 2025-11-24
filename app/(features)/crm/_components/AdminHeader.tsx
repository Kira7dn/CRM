"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { logoutAction } from "../../_shared/actions/auth-actions"
import { useState } from "react"
import Image from "next/image"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@shared/ui/navigation-menu"
import { Button } from "@shared/ui/button"
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Image as ImageIcon,
  FileText,
  User,
  BarChart3,
  TrendingUp,
  UserCog,
  Target,
  LineChart,
  Menu,
  X,
  LogOut,
  DollarSign,
  Warehouse
} from "lucide-react"
import { cn } from "@shared/utils"

interface AdminHeaderProps {
  userName?: string
  userRole?: string
}

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  roles: string[]
}

interface NavGroup {
  label: string
  items: NavItem[]
}

// Reusable navigation configuration
const NAV_GROUPS: Array<NavGroup & { key: string }> = [
  {
    key: "management",
    label: "Quản lý",
    items: [
      { href: "/crm/managements", label: "Tổng quan", icon: Home, roles: ["admin", "sale", "warehouse"] },
      { href: "/crm/managements/products", label: "Sản phẩm", icon: Package, roles: ["admin", "sale", "warehouse"] },
      { href: "/crm/managements/orders", label: "Đơn hàng", icon: ShoppingCart, roles: ["admin", "sale", "warehouse"] },
      { href: "/crm/managements/categories", label: "Danh mục", icon: Tag, roles: ["admin", "sale"] },
      { href: "/crm/managements/inventory", label: "Kho hàng", icon: Warehouse, roles: ["admin", "warehouse"] },
      { href: "/crm/managements/operational-costs", label: "Chi phí", icon: DollarSign, roles: ["admin"] },
    ],
  },
  {
    key: "analytics",
    label: "Phân tích",
    items: [
      { href: "/crm/analytics", label: "Tổng quan", icon: BarChart3, roles: ["admin"] },
      { href: "/crm/analytics/revenue", label: "Doanh thu", icon: TrendingUp, roles: ["admin"] },
      { href: "/crm/analytics/customer", label: "Khách hàng", icon: Users, roles: ["admin"] },
      { href: "/crm/analytics/campaign", label: "Chiến dịch", icon: Target, roles: ["admin"] },
      { href: "/crm/analytics/staff", label: "Nhân viên", icon: UserCog, roles: ["admin"] },
      { href: "/crm/analytics/forecast", label: "Dự báo", icon: LineChart, roles: ["admin"] },
    ],
  },
  {
    key: "customers",
    label: "Khách hàng",
    items: [
      { href: "/crm/customers", label: "Tổng quan", icon: BarChart3, roles: ["admin", "sale"] },
      { href: "/crm/customers/tickets", label: "Tickets", icon: Users, roles: ["admin", "sale"] },
    ],
  },
  {
    key: "campaigns",
    label: "Chiến dịch",
    items: [
      { href: "/crm/campaigns", label: "Tổng quan", icon: BarChart3, roles: ["admin", "sale"] },
      { href: "/crm/campaigns/banners", label: "Banner", icon: ImageIcon, roles: ["admin", "sale"] },
      { href: "/crm/campaigns/posts", label: "Bài viết", icon: FileText, roles: ["admin", "sale"] },
    ],
  },
]

// Reusable component for rendering navigation items
const NavItemLink = ({
  item,
  isActive,
  onClick,
}: {
  item: NavItem
  isActive: boolean
  onClick?: () => void
}) => {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        isActive && "bg-accent text-accent-foreground"
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <div className="text-sm font-medium leading-none">{item.label}</div>
      </div>
    </Link>
  )
}

// Desktop dropdown navigation component
const DesktopNavDropdown = ({
  group,
  isActive,
}: {
  group: NavGroup & { key: string }
  isActive: (href: string) => boolean
}) => {
  if (group.items.length === 0) return null

  return (
    <NavigationMenuItem suppressHydrationWarning>
      <NavigationMenuTrigger suppressHydrationWarning>{group.label}</NavigationMenuTrigger>
      <NavigationMenuContent suppressHydrationWarning>
        <div className="grid gap-3 p-4 w-[200px] md:w-[200px] md:grid-cols-1">
          {group.items.map((item) => (
            <NavigationMenuLink key={item.href} asChild>
              <NavItemLink item={item} isActive={isActive(item.href)} />
            </NavigationMenuLink>
          ))}
        </div>
      </NavigationMenuContent>
    </NavigationMenuItem>
  )
}

// Mobile navigation section component
const MobileNavSection = ({
  group,
  isActive,
  onNavigate,
}: {
  group: NavGroup & { key: string }
  isActive: (href: string) => boolean
  onNavigate: () => void
}) => {
  if (group.items.length === 0) return null

  return (
    <div>
      <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {group.label}
      </div>
      <div className="space-y-1 mt-1">
        {group.items.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition",
                isActive(item.href)
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export function AdminHeader({ userName, userRole = 'sale' }: AdminHeaderProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Filter navigation groups based on user role
  const filteredNavGroups = NAV_GROUPS.map(group => ({
    ...group,
    items: group.items.filter(item => item.roles.includes(userRole))
  }))

  const isActive = (href: string) => {
    if (href === "/crm/managements") {
      return pathname === "/crm/managements" || pathname === "/crm"
    }
    if (href === "/crm/analytics") {
      return pathname === "/crm/analytics"
    }
    if (href === "/crm/customers") {
      return pathname === "/crm/customers"
    }
    if (href === "/crm/campaigns") {
      return pathname === "/crm/campaigns"
    }
    return pathname?.startsWith(href)
  }

  const handleLogout = async () => {
    await logoutAction()
  }

  return (
    <header className="bg-background border-b sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/crm/managements" className="flex items-center space-x-2 hover:opacity-80 transition">
              <Image src="/logo-full.png" alt="Logo" width={32} height={32} />
              <div className="flex flex-col">
                <span className="text-lg font-bold leading-tight">
                  Hải Sản Ngày Mới
                </span>
                <span className="text-xs text-muted-foreground">
                  CRM: Quản lý Quan hệ Khách hàng
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden lg:flex" viewport={false} suppressHydrationWarning>
            <NavigationMenuList>
              {/* Dynamic navigation groups */}
              {filteredNavGroups.map((group) => (
                <DesktopNavDropdown key={group.key} group={group} isActive={isActive} />
              ))}

              {/* Users - Direct Link (Admin only) */}
              {userRole === "admin" && (
                <NavigationMenuItem>
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      isActive("/crm/users") && "bg-accent text-accent-foreground"
                    )}
                    asChild
                  >
                    <Link href="/crm/users" passHref className="flex items-center gap-1">
                      <div>Users Management</div>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>

          {/* User Menu & Actions */}
          <div className="flex items-center gap-4">
            {/* User Info - Hidden on small screens */}
            <div className="hidden md:block text-right">
              <div className="text-sm font-medium">
                {userName || "Admin"}
              </div>
              <div className="text-xs text-muted-foreground capitalize">
                {userRole}
              </div>
            </div>

            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              variant="destructive"
              size="sm"
              className="hidden sm:flex"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>

            {/* Mobile Menu Button */}
            <Button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              variant="ghost"
              size="icon"
              className="lg:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-4 pt-2 space-y-3">
            {/* User Info - Mobile */}
            <div className="px-3 py-2 mb-2 bg-muted rounded-lg">
              <div className="text-sm font-medium">
                {userName || "Admin"}
              </div>
              <div className="text-xs text-muted-foreground capitalize">
                {userRole}
              </div>
            </div>

            {/* Dynamic navigation sections */}
            {filteredNavGroups.map((group) => (
              <MobileNavSection
                key={group.key}
                group={group}
                isActive={isActive}
                onNavigate={() => setMobileMenuOpen(false)}
              />
            ))}

            {/* Users - Mobile (Admin only) */}
            {userRole === "admin" && (
              <Link
                href="/crm/users"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition",
                  isActive("/crm/users")
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <User className="h-4 w-4" />
                Users
              </Link>
            )}

            {/* Logout Button - Mobile */}
            <Button
              onClick={handleLogout}
              variant="destructive"
              size="sm"
              className="w-full"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
