"use client";

/**
 * Top Customers Table Component
 *
 * Displays top customers by revenue with tier badges.
 */

import { TopCustomer } from "@/core/domain/analytics/revenue-metrics";
import { Card } from "@/@shared/ui/card";
import { Crown, Star, User, Sparkles } from "lucide-react";

interface TopCustomersTableProps {
  customers: TopCustomer[];
}

export function TopCustomersTable({ customers }: TopCustomersTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "premium":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
            <Crown className="w-3 h-3" />
            Premium
          </span>
        );
      case "vip":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">
            <Sparkles className="w-3 h-3" />
            VIP
          </span>
        );
      case "regular":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
            <Star className="w-3 h-3" />
            Regular
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
            <User className="w-3 h-3" />
            New
          </span>
        );
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Top Customers by Revenue</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Rank</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Customer</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Tier</th>
              <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">Revenue</th>
              <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">Orders</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  No data available for this period
                </td>
              </tr>
            ) : (
              customers.map((customer, index) => (
                <tr key={customer.customerId} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-sm font-semibold">
                      {index + 1}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <div>
                      <p className="font-medium text-gray-900">{customer.customerName}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {customer.phone && <span>{customer.phone}</span>}
                        {customer.platform && (
                          <span className="px-1.5 py-0.5 bg-gray-100 rounded">
                            {customer.platform}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    {getTierBadge(customer.tier)}
                  </td>
                  <td className="py-3 px-2 text-right font-semibold text-gray-900">
                    {formatCurrency(customer.totalRevenue)}
                  </td>
                  <td className="py-3 px-2 text-right text-gray-700">
                    {customer.orderCount}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
