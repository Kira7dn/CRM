import crypto from "crypto";

export interface VnpayIpnRequest {
  ipnResponseData?: unknown;
  ipnReceivedData?: unknown;
  ipnRequestIP?: unknown;
}

export interface VnpayIpnParams {
  [key: string]: string;
}

export interface VnpayIpnResult {
  returnCode: number;
  returnMessage: string;
  orderId?: number;
  isSuccess: boolean;
}
export interface VnpayGateway {
  /**
   * Validate VNPay IPN signature
   */
  validateSignature(params: VnpayIpnParams): Promise<boolean>;

  /**
   * Extract order ID from VNPay order info
   */
  extractOrderId(orderInfo: string): number | null;

  /**
   * Parse VNPay IPN response to determine payment result
   */
  parsePaymentResult(params: VnpayIpnParams): VnpayIpnResult;
}

export class VnpayGatewayImpl implements VnpayGateway {
  constructor() {}

  async validateSignature(params: VnpayIpnParams): Promise<boolean> {
    const secureHash = params.vnp_SecureHash;
    const secretKey = process.env.VNP_HASH_SECRET;
    if (!secureHash || !secretKey) {
      return false;
    }

    // Create sorted parameter string excluding vnp_SecureHash
    const sortedParams = Object.keys(params)
      .filter((key) => key !== "vnp_SecureHash")
      .sort()
      .map((key) => `${key}=${params[key] ?? ""}`)
      .join("&");

    // Generate signature
    const signed = crypto
      .createHmac("sha512", secretKey)
      .update(sortedParams)
      .digest("hex");

    return signed.toUpperCase() === secureHash.toUpperCase();
  }

  extractOrderId(orderInfo: string): number | null {
    if (!orderInfo) return null;

    let decoded = orderInfo;
    try {
      decoded = decodeURIComponent(orderInfo);
    } catch {}

    const normalized = decoded.trim();
    if (!normalized) return null;

    // Try to extract from "++" separator (format: "info++orderId")
    const lastPlusIdx = normalized.lastIndexOf("++");
    if (lastPlusIdx >= 0) {
      const maybe = normalized.slice(lastPlusIdx + 2).trim();
      const asNumber = Number(maybe);
      if (!Number.isNaN(asNumber)) return asNumber;
    }

    // Fallback: extract last number from string
    const digits = normalized.match(/\d+/g);
    if (digits && digits.length > 0) {
      const lastNumber = digits[digits.length - 1];
      const asNumber = Number(lastNumber);
      if (!Number.isNaN(asNumber)) return asNumber;
    }

    return null;
  }

  parsePaymentResult(params: VnpayIpnParams): VnpayIpnResult {
    const responseCode = params.vnp_ResponseCode;
    const txnStatus = params.vnp_TransactionStatus;
    const isSuccess = responseCode === "00" && txnStatus === "00";

    const orderId = params.vnp_OrderInfo ? this.extractOrderId(params.vnp_OrderInfo) : null;

    if (!orderId) {
      return {
        returnCode: 0,
        returnMessage: "Order info missing",
        isSuccess: false,
      };
    }

    if (isSuccess) {
      return {
        returnCode: 1,
        returnMessage: "Success",
        orderId,
        isSuccess: true,
      };
    }

    return {
      returnCode: 0,
      returnMessage: "Payment failed",
      orderId,
      isSuccess: false,
    };
  }
}
