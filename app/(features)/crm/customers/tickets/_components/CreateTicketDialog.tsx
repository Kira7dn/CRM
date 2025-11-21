"use client";

import { useState, useTransition } from "react";
import { createTicketAction } from "../actions";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/@shared/ui/drawer";
import { Button } from "@/@shared/ui/button";
import { Input } from "@/@shared/ui/input";
import { Label } from "@/@shared/ui/label";
import { X } from "lucide-react";

interface CreateTicketDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateTicketDialog({ isOpen, onClose }: CreateTicketDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createTicketAction(formData);

      if (result.success) {
        onClose();
        window.location.reload(); // Refresh to show new ticket
      } else {
        setError(result.error || "Failed to create ticket");
      }
    });
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-w-2xl mx-auto">
        <DrawerHeader className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-2xl font-bold">Create New Ticket</DrawerTitle>
              <DrawerDescription className="text-gray-600 dark:text-gray-400 mt-1">
                Create a new support ticket for a customer issue
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Customer ID */}
          <div className="space-y-2">
            <Label htmlFor="customerId">Customer ID *</Label>
            <Input
              id="customerId"
              name="customerId"
              required
              placeholder="Enter customer ID"
              className="w-full"
            />
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              name="subject"
              required
              placeholder="Brief description of the issue"
              maxLength={200}
              className="w-full"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              placeholder="Detailed description of the issue"
              maxLength={5000}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Priority and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <select
                id="priority"
                name="priority"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium" selected>
                  Medium
                </option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                name="category"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="order_issue">Order Issue</option>
                <option value="product_inquiry">Product Inquiry</option>
                <option value="payment_issue">Payment Issue</option>
                <option value="delivery_issue">Delivery Issue</option>
                <option value="refund_request">Refund Request</option>
                <option value="complaint">Complaint</option>
                <option value="feedback">Feedback</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Source */}
          <div className="space-y-2">
            <Label htmlFor="source">Source *</Label>
            <select
              id="source"
              name="source"
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="zalo">Zalo</option>
              <option value="facebook">Facebook</option>
              <option value="telegram">Telegram</option>
              <option value="phone">Phone</option>
              <option value="email">Email</option>
              <option value="website">Website</option>
              <option value="internal" selected>
                Internal
              </option>
            </select>
          </div>

          {/* Optional: Order ID */}
          <div className="space-y-2">
            <Label htmlFor="orderId">Related Order ID (Optional)</Label>
            <Input
              id="orderId"
              name="orderId"
              type="number"
              placeholder="Enter order ID if related to an order"
              className="w-full"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (Optional)</Label>
            <Input
              id="tags"
              name="tags"
              placeholder="Comma-separated tags (e.g., urgent, vip-customer)"
              className="w-full"
            />
          </div>

          <DrawerFooter className="border-t border-gray-200 dark:border-gray-700 px-0 pt-6">
            <div className="flex justify-end gap-3">
              <DrawerClose asChild>
                <Button type="button" variant="outline" disabled={isPending}>
                  Cancel
                </Button>
              </DrawerClose>
              <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700">
                {isPending ? "Creating..." : "Create Ticket"}
              </Button>
            </div>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
