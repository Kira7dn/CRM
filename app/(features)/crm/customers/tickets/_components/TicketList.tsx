"use client";

import { useState } from "react";
import type { Ticket as TicketModel, TicketStatus, TicketPriority } from "@/core/domain/customers/ticket";
import { getTicketStatusColor, getTicketPriorityColor, isTicketOverdue } from "@/core/domain/customers/ticket";
import { updateTicketStatusAction, assignTicketAction, resolveTicketAction } from "../actions";
import { Badge } from "@/@shared/ui/badge";
import { Button } from "@/@shared/ui/button";
import {
  Clock,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  Calendar,
  Tag,
  Ticket,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TicketListProps {
  initialTickets: TicketModel[];
}

export function TicketList({ initialTickets }: TicketListProps) {
  const [tickets, setTickets] = useState<TicketModel[]>(initialTickets);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "all">("all");

  // Filter tickets
  const filteredTickets = tickets.filter((ticket) => {
    if (statusFilter !== "all" && ticket.status !== statusFilter) return false;
    if (priorityFilter !== "all" && ticket.priority !== priorityFilter) return false;
    return true;
  });

  // Count by status
  const statusCounts = {
    all: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    waiting_customer: tickets.filter((t) => t.status === "waiting_customer").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    closed: tickets.filter((t) => t.status === "closed").length,
  };

  // Get status badge color
  const getStatusBadge = (status: TicketStatus) => {
    const colors: Record<TicketStatus, string> = {
      open: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      waiting_customer: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      resolved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      closed: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400",
      cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400",
    };
    return colors[status];
  };

  // Get priority badge color
  const getPriorityBadge = (priority: TicketPriority) => {
    const colors: Record<TicketPriority, string> = {
      urgent: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      high: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      low: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400",
    };
    return colors[priority];
  };

  // Handle quick status update
  const handleStatusUpdate = async (ticketId: string, newStatus: TicketStatus) => {
    try {
      const result = await updateTicketStatusAction(ticketId, newStatus);
      if (result.success) {
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus, updatedAt: new Date() } : t))
        );
      } else {
        alert(result.error || "Failed to update ticket status");
      }
    } catch (error: any) {
      alert(error.message || "Failed to update ticket status");
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Filter Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition ${statusFilter === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
          >
            All ({statusCounts.all})
          </button>
          <button
            onClick={() => setStatusFilter("open")}
            className={`px-4 py-2 rounded-lg font-medium transition ${statusFilter === "open"
              ? "bg-red-600 text-white"
              : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
          >
            Open ({statusCounts.open})
          </button>
          <button
            onClick={() => setStatusFilter("in_progress")}
            className={`px-4 py-2 rounded-lg font-medium transition ${statusFilter === "in_progress"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
          >
            In Progress ({statusCounts.in_progress})
          </button>
          <button
            onClick={() => setStatusFilter("resolved")}
            className={`px-4 py-2 rounded-lg font-medium transition ${statusFilter === "resolved"
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
          >
            Resolved ({statusCounts.resolved})
          </button>
        </div>
      </div>

      {/* Priority Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Priority:</span>
          <div className="flex flex-wrap gap-2">
            {["all", "urgent", "high", "medium", "low"].map((priority) => (
              <button
                key={priority}
                onClick={() => setPriorityFilter(priority as TicketPriority | "all")}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition ${priorityFilter === priority
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
              >
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
        {filteredTickets.length === 0 ? (
          <div className="text-center py-16">
            <Ticket className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">No tickets found</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
              Try adjusting your filters or create a new ticket
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ticket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Assigned
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTickets.map((ticket) => {
                  const overdue = isTicketOverdue(ticket);

                  return (
                    <tr
                      key={ticket.id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-750 ${overdue ? "bg-red-50 dark:bg-red-900/10" : ""
                        }`}
                    >
                      {/* Ticket Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          {overdue && (
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {ticket.ticketNumber}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                              {ticket.subject}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500 dark:text-gray-500 capitalize">
                                {ticket.category.replace("_", " ")}
                              </span>
                              {ticket.comments.length > 0 && (
                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                  <MessageSquare className="w-3 h-3" />
                                  {ticket.comments.length}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {ticket.customerName || "Unknown"}
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getPriorityBadge(ticket.priority)}>
                          {ticket.priority.toUpperCase()}
                        </Badge>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusBadge(ticket.status)}>
                          {ticket.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </td>

                      {/* Assigned */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {ticket.assignedToName ? (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900 dark:text-white">
                              {ticket.assignedToName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Unassigned</span>
                        )}
                      </td>

                      {/* Created */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {ticket.status === "open" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusUpdate(ticket.id, "in_progress")}
                              className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                              Start
                            </Button>
                          )}
                          {ticket.status === "in_progress" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusUpdate(ticket.id, "resolved")}
                              className="text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => (window.location.href = `/customer-care/tickets/${ticket.id}`)}
                          >
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
