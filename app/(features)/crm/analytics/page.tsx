import Link from "next/link"
import { getCurrentUserAction } from "../../_shared/actions/auth-actions"
import { TrendingUp, Users, Trophy, BarChart3, ArrowRight, Target } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@shared/ui/card"

export default async function AnalyticsHomePage() {
  const user = await getCurrentUserAction()

  const analyticsModules = [
    {
      href: "/crm/analytics/revenue",
      title: "Revenue Analytics",
      description: "Track revenue trends, top products, and financial metrics across customizable time periods",
      icon: TrendingUp,
      color: "emerald",
      features: [
        "Period comparison & trends",
        "Top performing products",
        "Order status distribution",
        "Average order value tracking"
      ],
      roles: ["admin", "sale"]
    },
    {
      href: "/crm/analytics/customer",
      title: "Customer Behavior",
      description: "Understand customer lifecycle, segment by value, and detect churn risks",
      icon: Users,
      color: "cyan",
      features: [
        "RFM segmentation (11 segments)",
        "Churn risk detection",
        "Cohort retention analysis",
        "Purchase pattern insights"
      ],
      roles: ["admin", "sale"]
    },
    {
      href: "/crm/analytics/campaign",
      title: "Campaign Performance",
      description: "Track ROI, compare campaigns, and optimize marketing spend across platforms",
      icon: Target,
      color: "purple",
      features: [
        "Campaign ROI tracking",
        "Multi-campaign comparison",
        "Platform performance breakdown",
        "UTM parameter analytics"
      ],
      roles: ["admin", "sale"]
    },
    {
      href: "/crm/analytics/staff",
      title: "Staff Performance",
      description: "Monitor team performance, rankings, and individual staff activity",
      icon: Trophy,
      color: "amber",
      features: [
        "Team performance metrics",
        "Staff leaderboard & rankings",
        "Performance tier classification",
        "Daily activity tracking"
      ],
      roles: ["admin"]
    },
  ].filter(module => module.roles.includes(user?.role || ""))

  const colorClasses = {
    emerald: {
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      border: "border-emerald-200 dark:border-emerald-800",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
      iconText: "text-emerald-600 dark:text-emerald-400",
      hoverBorder: "hover:border-emerald-400 dark:hover:border-emerald-600"
    },
    cyan: {
      bg: "bg-cyan-50 dark:bg-cyan-900/20",
      border: "border-cyan-200 dark:border-cyan-800",
      iconBg: "bg-cyan-100 dark:bg-cyan-900/30",
      iconText: "text-cyan-600 dark:text-cyan-400",
      hoverBorder: "hover:border-cyan-400 dark:hover:border-cyan-600"
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-900/20",
      border: "border-purple-200 dark:border-purple-800",
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      iconText: "text-purple-600 dark:text-purple-400",
      hoverBorder: "hover:border-purple-400 dark:hover:border-purple-600"
    },
    amber: {
      bg: "bg-amber-50 dark:bg-amber-900/20",
      border: "border-amber-200 dark:border-amber-800",
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
      iconText: "text-amber-600 dark:text-amber-400",
      hoverBorder: "hover:border-amber-400 dark:hover:border-amber-600"
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          {/* Additional Info */}
          <div className="mt-4 max-w-7xl mx-auto">
            <div className="bg-linear-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 rounded-lg shadow-xl p-6 hover:shadow-2xl transition transform hover:-translate-y-1 border-2 border-blue-400 dark:border-blue-600">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <h3 className="text-xl font-bold text-white">
                      Analytics & Reports
                    </h3>
                  </div>
                  <p className="text-sm text-blue-100 mt-2">
                    Comprehensive business intelligence dashboard with revenue tracking, customer insights, and team performance metrics
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-white/20 text-white text-xs font-medium rounded-full backdrop-blur-sm">
                      Revenue
                    </span>
                    <span className="px-3 py-1 bg-white/20 text-white text-xs font-medium rounded-full backdrop-blur-sm">
                      Customer Insights
                    </span>
                    {user?.role === "admin" && (
                      <span className="px-3 py-1 bg-white/20 text-white text-xs font-medium rounded-full backdrop-blur-sm">
                        Staff Performance
                      </span>
                    )}
                  </div>
                </div>
                <div className="hidden sm:block bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Modules */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {analyticsModules.map((module) => {
            const Icon = module.icon
            const colors = colorClasses[module.color as keyof typeof colorClasses]

            return (
              <Link
                key={module.href}
                href={module.href}
                className="group"
              >
                <Card className={`${colors.bg} ${colors.border} border-2 transition-all duration-300 hover:shadow-xl ${colors.hoverBorder} hover:-translate-y-1`}>
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-900 dark:text-white flex justify-between">
                      <div className="flex items-start justify-between mb-2 gap-4">
                        <div className={`${colors.iconBg} p-3 rounded-lg `}>
                          <Icon className={`w-8 h-8 ${colors.iconText}`} />
                        </div>
                        <div className="h-full text-lg text-left">
                          {module.title}
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      {module.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-2 h-[140px] overflow-hidden">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Key Features
                      </p>
                      <ul className="space-y-1">
                        {module.features.map((feature, index) => (
                          <li
                            key={index}
                            className="flex items-start text-sm text-gray-700 dark:text-gray-300"
                          >
                            <span className={`${colors.iconText} mr-2 mt-0.5`}>•</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>

                  <CardFooter className="border-t border-gray-200 dark:border-gray-700">
                    <span className={`text-sm font-medium ${colors.iconText} group-hover:underline`}>
                      View Analytics →
                    </span>
                  </CardFooter>
                </Card>
              </Link>
            )
          })}
        </div>


      </div>
    </div>
  )
}
