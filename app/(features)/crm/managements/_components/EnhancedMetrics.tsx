"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@shared/ui/card"
import { TrendingDown, Users, Clock, AlertCircle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface DecliningProduct {
  productId: string
  productName: string
  recentQuantity: number
  previousQuantity: number
  declinePercent: number
}

interface StaffPerformance {
  staffId: string
  orderCount: number
  revenue: number
  avgProcessingTime: number
}

interface EnhancedMetricsProps {
  avgLTV: number
  decliningProducts: DecliningProduct[]
  topPerformingStaff: StaffPerformance[]
  lateOrders: number
  avgProcessingTime: number
}

export function EnhancedMetrics({
  avgLTV,
  decliningProducts,
  topPerformingStaff,
  lateOrders,
  avgProcessingTime,
}: EnhancedMetricsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Customer LTV & Operational Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            Khách hàng & Vận hành
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">LTV TB khách hàng</div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatCurrency(avgLTV)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Giá trị trọn đời mỗi KH
              </div>
            </div>

            <div className={`p-3 rounded-lg border ${
              lateOrders > 0
                ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                : "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
            }`}>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Đơn trễ hạn</div>
              <div className={`text-2xl font-bold ${
                lateOrders > 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-green-600 dark:text-green-400"
              }`}>
                {lateOrders}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Quá thời gian giao hàng
              </div>
            </div>
          </div>

          {avgProcessingTime > 0 && (
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                <Clock className="w-4 h-4" />
                Thời gian xử lý TB
              </div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {avgProcessingTime.toFixed(1)} giờ
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Từ xác nhận đến xử lý
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Declining Products */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            Sản phẩm sụt giảm
          </CardTitle>
        </CardHeader>
        <CardContent>
          {decliningProducts.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              Không phát hiện sản phẩm sụt giảm
            </p>
          ) : (
            <div className="space-y-2">
              {decliningProducts.map((product) => (
                <div
                  key={product.productId}
                  className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                        {product.productName}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {product.recentQuantity} sp (trước đây {product.previousQuantity})
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <div className="text-sm font-bold text-orange-600 dark:text-orange-400">
                        {product.declinePercent.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">giảm</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Staff Performance */}
      {topPerformingStaff.length > 0 && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
              Nhân viên xuất sắc
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {topPerformingStaff.map((staff, idx) => (
                <div
                  key={staff.staffId}
                  className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center text-sm font-bold text-green-700 dark:text-green-300">
                        #{idx + 1}
                      </div>
                      <div className="font-medium text-sm text-gray-900 dark:text-white">
                        Staff {staff.staffId}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>Doanh thu:</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(staff.revenue)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Đơn hàng:</span>
                      <span className="font-semibold">{staff.orderCount}</span>
                    </div>
                    {staff.avgProcessingTime > 0 && (
                      <div className="flex justify-between">
                        <span>TG TB:</span>
                        <span className="font-semibold">{staff.avgProcessingTime.toFixed(1)}h</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
