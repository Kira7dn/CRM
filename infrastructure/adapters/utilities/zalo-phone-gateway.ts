import type { PhoneService } from "@/core/application/interfaces/phone-service";

const ZALO_PHONE_ENDPOINT = "https://graph.zalo.me/v2.0/me/info";

export class ZaloPhoneGateway implements PhoneService {
  async decodePhone(token: string, accessToken: string): Promise<string> {
    const ZALO_APP_SECRET = process.env.ZALO_APP_SECRET;
    if (!ZALO_APP_SECRET) {
      throw new Error("Server chưa được cấu hình ZALO_APP_SECRET.");
    }

    // Call Zalo Open API to decode phone
    const zaloResponse = await fetch(ZALO_PHONE_ENDPOINT, {
      method: "GET",
      headers: {
        access_token: accessToken,
        code: token,
        secret_key: ZALO_APP_SECRET,
      },
    });

    const bodyText = await zaloResponse.text();

    let payload: any;
    try {
      payload = JSON.parse(bodyText);
    } catch {
      throw new Error("INVALID_JSON");
    }

    if (!zaloResponse.ok || payload.error) {
      const errorMessage =
        payload?.message || "Không thể giải mã số điện thoại từ token. Vui lòng thử lại hoặc kiểm tra cấu hình.";
      throw new Error(errorMessage);
    }

    const phoneNumber = payload?.data?.number;
    if (!phoneNumber) {
      throw new Error("Zalo Open API không trả về số điện thoại hợp lệ.");
    }

    return phoneNumber;
  }
}
