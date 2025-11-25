"use client"

import { useState } from "react"
import type { Customer } from "@/core/domain/customers/customer"
import { deleteCustomerAction } from "../actions"
import { CustomerForm } from "./CustomerForm"

interface CustomerListProps {
  initialCustomers: Customer[]
}

export function CustomerList({ initialCustomers }: CustomerListProps) {
  const [customers, setCustomers] = useState(initialCustomers)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPlatform, setSelectedPlatform] = useState<string | undefined>()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)

  // Filter customers
  const filteredCustomers = customers.filter((customer) => {
    const matchesPlatform = !selectedPlatform || customer.primarySource === selectedPlatform
    const matchesSearch = !searchQuery ||
      customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.includes(searchQuery)
    return matchesPlatform && matchesSearch
  })

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) {
      return
    }

    try {
      await deleteCustomerAction(id)
      setCustomers(customers.filter((c) => c.id !== id))
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete customer")
    }
  }

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingCustomer(null)
  }

  const getPlatformIcon = (primarySource: string) => {
    const icons: Record<string, string> = {
      zalo: "💬",
      facebook: "📘",
      telegram: "✈️",
      tiktok: "🎵",
      website: "🌐",
      other: "📱",
    }
    return icons[primarySource] || "👤"
  }

  const getPlatformColor = (primarySource: string) => {
    const colors: Record<string, string> = {
      zalo: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      facebook: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
      telegram: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
      tiktok: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      website: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      other: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400",
    }
    return colors[primarySource] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
  }

  return (
    <div>
      {/* Filters & Actions */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
        />

        {/* Platform Filter */}
        <select
          value={selectedPlatform || ""}
          onChange={(e) => setSelectedPlatform(e.target.value || undefined)}
          className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
        >
          <option value="">All Platforms</option>
          <option value="Zalo">Zalo</option>
          <option value="Facebook">Facebook</option>
          <option value="Telegram">Telegram</option>
        </select>

        {/* Add Customer Button */}
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
        >
          Add Customer
        </button>
      </div>

      {/* Customer Table */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Platform
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredCustomers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="shrink-0 h-10 w-10">
                      {customer.avatar ? (
                        <img
                          src={customer.avatar}
                          alt={customer.name || "Customer"}
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                          {customer.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {customer.name || "Unknown"}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {customer.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPlatformColor(customer.primarySource)}`}>
                    {getPlatformIcon(customer.primarySource)} {customer.primarySource}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {customer.phone || "-"}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {customer.email || "-"}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {customer.address || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(customer)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(customer.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No customers found
          </div>
        )}
      </div>

      {/* Customer Form Modal */}
      {isFormOpen && (
        <CustomerForm customer={editingCustomer} onClose={handleCloseForm} />
      )}
    </div>
  )
}
