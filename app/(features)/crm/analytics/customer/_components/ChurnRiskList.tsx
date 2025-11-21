"use client";

/**
 * Churn Risk List Component
 *
 * Table of customers at risk of churning with action buttons.
 */

import { PurchasePattern } from "@/core/domain/analytics/customer-metrics";
import { Card } from "@/@shared/ui/card";
import { Button } from "@/@shared/ui/button";
import { AlertTriangle, AlertCircle, Info, MessageCircle } from "lucide-react";

interface ChurnRiskListProps {
  customers: PurchasePattern[];
}

export function ChurnRiskList({ customers }: ChurnRiskListProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "high":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "medium":
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "high":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
            <AlertTriangle className="w-3 h-3" />
            High Risk
          </span>
        );
      case "medium":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">
            <AlertCircle className="w-3 h-3" />
            Medium Risk
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
            <Info className="w-3 h-3" />
            Low Risk
          </span>
        );
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Customers at Risk of Churning</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Customer</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Risk</th>
              <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">
                Days Since Purchase
              </th>
              <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">
                Total Revenue
              </th>
              <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">Orders</th>
              <th className="text-center py-3 px-2 text-sm font-medium text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  No customers at risk
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.customerId} className="border-b border-gray-100 hover:bg-gray-50">
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
                  <td className="py-3 px-2">{getRiskBadge(customer.churnRisk)}</td>
                  <td className="py-3 px-2 text-right">
                    <span className="font-semibold text-red-600">
                      {customer.daysSinceLastPurchase} days
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right font-semibold text-gray-900">
                    {formatCurrency(customer.totalRevenue)}
                  </td>
                  <td className="py-3 px-2 text-right text-gray-700">
                    {customer.totalOrders}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1"
                      onClick={() => {
                        // TODO: Implement send care message
                        alert(`Send care message to ${customer.customerName}`);
                      }}
                    >
                      <MessageCircle className="w-3 h-3" />
                      Contact
                    </Button>
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
