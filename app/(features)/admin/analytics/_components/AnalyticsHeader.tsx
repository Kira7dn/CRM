"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { logoutAction } from "../../../_shared/actions/auth-actions"
import { useState } from "react"
import Image from "next/image"
import {
  BarChart3,
  Users,
  Trophy,
  TrendingUp,
  LayoutDashboard,
  ChevronLeft,
  Menu,
  X,
  LogOut,
  Brain
} from "lucide-react"

interface AnalyticsHeaderProps {
  userName?: string
  userRole?: string
}

export function AnalyticsHeader({ userName, userRole = 'admin' }: AnalyticsHeaderProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const analyticsNavItems = [
    {
      href: "/admin/analytics/revenue",
      label: "Revenue Analytics",
      icon: TrendingUp,
      roles: ["admin", "sale"]
    },
    {
      href: "/admin/analytics/customer",
      label: "Customer Analytics",
      icon: Users,
      roles: ["admin", "sale"]
    },
    {
      href: "/admin/analytics/campaign",
      label: "Campaign Performance",
      icon: BarChart3,
      roles: ["admin", "sale"]
    },
    {
      href: "/admin/analytics/staff",
      label: "Staff Performance",
      icon: Trophy,
      roles: ["admin"]
    },
    {
      href: "/admin/analytics/forecast",
      label: "AI Forecasts",
      icon: Brain,
      roles: ["admin", "sale"]
    },
  ].filter(item => item.roles.includes(userRole))

  const isActive = (href: string) => {
    return pathname?.startsWith(href)
  }

  const handleLogout = async () => {
    await logoutAction()
  }

  return (
    <header className="bg-linear-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 border-b border-blue-700 dark:border-blue-900 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand with Back to Dashboard */}
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/managements"
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/10 transition group"
              title="Back to Managements"
            >
              <ChevronLeft className="w-5 h-5 text-white group-hover:text-blue-100" />
              <LayoutDashboard className="w-5 h-5 text-white group-hover:text-blue-100" />
            </Link>

            <div className="h-8 w-px bg-white/20"></div>

            <div className="flex items-center space-x-2">
              <BarChart3 className="w-7 h-7 text-white" />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white leading-tight">
                  Analytics & Reports
                </span>
                <span className="text-xs text-blue-100 hidden sm:block">
                  Business Intelligence Dashboard
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {analyticsNavItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition ${isActive(item.href)
                    ? "bg-white text-blue-700 shadow-md"
                    : "text-white hover:bg-white/20"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* User Menu & Actions */}
          <div className="flex items-center space-x-4">
            {/* User Info - Hidden on small screens */}
            <div className="hidden md:block text-right">
              <div className="text-sm font-medium text-white">
                {userName || "Admin"}
              </div>
              <div className="text-xs text-blue-100 capitalize">
                {userRole}
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition shadow-md"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-white hover:bg-white/20"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-4 pt-2 space-y-1">
            {/* User Info - Mobile */}
            <div className="px-3 py-2 mb-2 bg-white/10 rounded-lg">
              <div className="text-sm font-medium text-white">
                {userName || "Admin"}
              </div>
              <div className="text-xs text-blue-100 capitalize">
                {userRole}
              </div>
            </div>

            {/* Back to Dashboard - Mobile */}
            <Link
              href="/admin/managements"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <LayoutDashboard className="w-4 h-4" />
              <span>Back to Managements</span>
            </Link>

            <div className="h-px bg-white/20 my-2"></div>

            {/* Navigation Links */}
            {analyticsNavItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition ${isActive(item.href)
                    ? "bg-white text-blue-700"
                    : "text-white hover:bg-white/20"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}

            {/* Logout Button - Mobile */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 mt-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
