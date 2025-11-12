import { createHmac } from "crypto";

export interface MacRequest {
  amount: number;
  desc: string;
  item: unknown;
  extradata?: string;
  method: string;
}

export interface MacResponse {
  mac: string;
}

export class MacRequestUseCase {
  async execute(request: MacRequest): Promise<MacResponse> {
    const { amount, desc, item, extradata, method } = request;

    if (typeof amount !== "number" || Number.isNaN(amount)) {
      throw new Error("amount phải là số hợp lệ.");
    }

    if (typeof desc !== "string") {
      throw new Error("desc là bắt buộc.");
    }

    const params: Record<string, unknown> = { amount, desc, item, extradata, method };
    const dataMac = Object.keys(params)
      .filter((key) => params[key] !== undefined)
      .sort()
      .map((key) => {
        const value = params[key];
        return `${key}=${typeof value === "object" ? JSON.stringify(value) : value}`;
      })
      .join("&");

    const secretKey = process.env.CHECKOUT_SDK_PRIVATE_KEY;
    if (!secretKey) {
      throw new Error("Server chưa cấu hình CHECKOUT_SDK_PRIVATE_KEY.");
    }

    const mac = createHmac("sha256", secretKey).update(dataMac).digest("hex");

    return { mac };
  }
}
