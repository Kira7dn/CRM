import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { updateOrderUseCase } from "@/lib/container";
import type { UpdateOrderPayload } from "@/core/application/interfaces/order-service";
import { notifyOrderWebhook } from "@/lib/webhook";

interface VnpayIpnRequestBody {
  ipnResponseData?: unknown;
  ipnReceivedData?: unknown;
  ipnRequestIP?: unknown;
}

function normalizeRecord(value: unknown): Record<string, string> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const result: Record<string, string> = {};
  for (const [key, raw] of Object.entries(value)) {
    if (raw === undefined || raw === null) continue;
    result[key] = typeof raw === "string" ? raw : String(raw);
  }
  return result;
}

function extractOrderIdFromInfo(raw?: string): number | null {
  if (!raw) return null;
  let decoded = raw;
  try { decoded = decodeURIComponent(raw); } catch {}
  const normalized = decoded.trim();
  if (!normalized) return null;
  const lastPlusIdx = normalized.lastIndexOf("++");
  if (lastPlusIdx >= 0) {
    const maybe = normalized.slice(lastPlusIdx + 2).trim();
    const asNumber = Number(maybe);
    if (!Number.isNaN(asNumber)) return asNumber;
  }
  const digits = normalized.match(/\d+/g);
  if (digits && digits.length > 0) {
    const lastNumber = digits[digits.length - 1];
    const asNumber = Number(lastNumber);
    if (!Number.isNaN(asNumber)) return asNumber;
  }
  return null;
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as VnpayIpnRequestBody;
  const { ipnReceivedData } = body ?? {};

  const receivedParams = normalizeRecord(ipnReceivedData);
  if (!receivedParams) {
    return NextResponse.json({ returnCode: -1, returnMessage: "Invalid payload" }, { status: 400 });
  }

  const secureHash = receivedParams.vnp_SecureHash;
  if (!secureHash) {
    return NextResponse.json({ returnCode: -1, returnMessage: "Missing signature" }, { status: 400 });
  }

  const secretKey = process.env.VNP_HASH_SECRET;
  if (!secretKey) {
    return NextResponse.json({ returnCode: -1, returnMessage: "Server misconfigured" }, { status: 500 });
  }

  const sortedParams = Object.keys(receivedParams)
    .filter((key) => key !== "vnp_SecureHash")
    .sort()
    .map((key) => `${key}=${receivedParams[key] ?? ""}`)
    .join("&");

  const signed = crypto.createHmac("sha512", secretKey).update(sortedParams).digest("hex");
  if (signed.toUpperCase() !== secureHash.toUpperCase()) {
    return NextResponse.json({ returnCode: -1, returnMessage: "Invalid signature" }, { status: 400 });
  }

  const orderId = extractOrderIdFromInfo(receivedParams.vnp_OrderInfo);
  if (orderId === null) {
    return NextResponse.json({ returnCode: 0, returnMessage: "Order info missing" });
  }

  const responseCode = receivedParams.vnp_ResponseCode;
  const txnStatus = receivedParams.vnp_TransactionStatus;
  const isSuccess = responseCode === "00" && txnStatus === "00";

  const updatePayload: UpdateOrderPayload = {
    paymentStatus: isSuccess ? "success" : "failed",
  };
  if (typeof receivedParams.vnp_TxnRef === "string" && receivedParams.vnp_TxnRef.trim()) {
    updatePayload.checkoutSdkOrderId = receivedParams.vnp_TxnRef.trim();
  }

  const { order: updated } = await updateOrderUseCase.execute({ id: orderId, payload: updatePayload });
  if (!updated) {
    return NextResponse.json({ returnCode: 0, returnMessage: "Order not found" });
  }

  if (isSuccess) {
    void notifyOrderWebhook(updated as any);
    return NextResponse.json({ returnCode: 1, returnMessage: "Success" });
  }

  return NextResponse.json({ returnCode: 0, returnMessage: "Payment failed" });
}
