import { NextRequest, NextResponse } from "next/server";
import { paymentCallbackUseCase } from "@/lib/container";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data, overallMac } = body;

    // Log webhook received
    console.log("[Webhook] Received webhook notification", {
      timestamp: new Date().toISOString(),
      type,
      headers: Object.fromEntries(request.headers),
      body
    });

    // Handle different webhook types
    switch (type) {
      case "payment_callback":
      case "checkout_callback": // Alternative type for backward compatibility
        // Handle payment callback from external payment gateway
        if (!data && !overallMac) {
          return NextResponse.json({
            success: false,
            message: "Missing data or overallMac in payment callback webhook"
          }, { status: 400 });
        }

        const result = await paymentCallbackUseCase.execute({
          data: data || body.data || body,
          overallMac: overallMac || body.overallMac
        });

        return NextResponse.json({
          success: result.returnCode === 1,
          returnCode: result.returnCode,
          returnMessage: result.returnMessage
        });

      case "order_notification":
        // Handle order-related notifications
        console.log("[Webhook] Order notification received", { data });
        return NextResponse.json({
          success: true,
          message: "Order notification processed"
        });

      case "user_action":
        // Handle user action notifications
        console.log("[Webhook] User action notification received", { data });
        return NextResponse.json({
          success: true,
          message: "User action notification processed"
        });

      default:
        // If no type specified, assume it's a direct payment callback
        if (data || overallMac) {
          const result = await paymentCallbackUseCase.execute({
            data: data || body,
            overallMac: overallMac || body.overallMac
          });

          return NextResponse.json({
            success: result.returnCode === 1,
            returnCode: result.returnCode,
            returnMessage: result.returnMessage
          });
        }

        // Unknown webhook type
        console.warn("[Webhook] Unknown webhook type received", { type });
        return NextResponse.json({
          success: false,
          message: `Unknown webhook type: ${type}`
        }, { status: 400 });
    }

  } catch (error) {
    console.error("[Webhook] Error processing webhook", {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: false,
      message: "Error processing webhook"
    }, { status: 500 });
  }
}
