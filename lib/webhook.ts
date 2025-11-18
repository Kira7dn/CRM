import type { Order } from "@/core/domain/order";

export const notifyOrderWebhook = async (order: Order): Promise<void> => {
  console.log("[notifyOrderWebhook] Starting webhook notification", {
    orderId: order.id,
    paymentStatus: order.payment?.status,
    timestamp: new Date().toISOString()
  });

  const externalWebhookUrl = process.env.ORDER_WEBHOOK_URL?.trim();
  console.log("[notifyOrderWebhook] Webhook URL check:", { 
    hasUrl: !!externalWebhookUrl, 
    url: externalWebhookUrl ? `${externalWebhookUrl.substring(0, 30)}${externalWebhookUrl.length > 30 ? '...' : ''}` : 'undefined' 
  });
  
  if (!externalWebhookUrl) {
    console.log("[notifyOrderWebhook] No webhook URL configured, skipping");
    return;
  }

  try {
    console.log("[notifyOrderWebhook] Sending webhook request", { 
      orderId: order.id,
      url: externalWebhookUrl,
      timestamp: new Date().toISOString()
    });

    const startTime = Date.now();
    const response = await fetch(externalWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Request-ID": `webhook-${order.id}-${Date.now()}`,
      },
      body: JSON.stringify({
        type: "payment_success",
        data: order,
        timestamp: new Date().toISOString()
      }),
    });

    const responseTime = Date.now() - startTime;
    const responseData = await response.text().catch(() => null);

    console.log("[notifyOrderWebhook] Webhook response received", {
      orderId: order.id,
      status: response.status,
      statusText: response.statusText,
      responseTime: `${responseTime}ms`,
      responseHeaders: Object.fromEntries(response.headers.entries()),
      responseBody: responseData
    });

    if (!response.ok) {
      console.error("[notifyOrderWebhook] External webhook failed", {
        orderId: order.id,
        status: response.status,
        statusText: response.statusText,
        responseBody: responseData,
        responseTime: `${responseTime}ms`
      });
      return;
    }

    console.log("[notifyOrderWebhook] External webhook sent successfully", { 
      orderId: order.id,
      status: response.status,
      responseTime: `${responseTime}ms`,
      responseData
    });
  } catch (error) {
    console.error("[notifyOrderWebhook] Error sending external webhook", {
      orderId: order.id,
      error: error instanceof Error
        ? { 
            name: error.name, 
            message: error.message, 
            stack: error.stack?.split('\n').slice(0, 3).join('\n') + '\n...' 
          }
        : error,
      timestamp: new Date().toISOString()
    });
  }
};
