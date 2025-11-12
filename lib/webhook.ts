import type { Order } from "@/core/domain/order";

export const notifyOrderWebhook = async (order: Order): Promise<void> => {
  // Since webhook processing is now handled directly in /api/webhook,
  // we just log successful payments for monitoring
  console.log("[notifyOrderWebhook] Payment processed successfully", {
    orderId: order.id,
    paymentStatus: order.paymentStatus,
    timestamp: new Date().toISOString()
  });

  // Optional: Send to external webhook URL if configured
  const externalWebhookUrl = process.env.EXTERNAL_WEBHOOK_URL?.trim();
  if (externalWebhookUrl) {
    try {
      const response = await fetch(externalWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "payment_success",
          data: order,
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => undefined);
        console.error("[notifyOrderWebhook] External webhook failed", {
          status: response.status,
          statusText: response.statusText,
          body: text,
          orderId: order.id,
        });
        return;
      }

      console.log("[notifyOrderWebhook] External webhook sent successfully", { orderId: order.id });
    } catch (error) {
      console.error("[notifyOrderWebhook] Error sending external webhook", {
        error: error instanceof Error
          ? { name: error.name, message: error.message, stack: error.stack }
          : error,
        orderId: order.id,
      });
    }
  }
};
