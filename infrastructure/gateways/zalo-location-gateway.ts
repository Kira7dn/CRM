import type { LocationService } from "@/core/application/interfaces/location-service";

const ZALO_LOCATION_ENDPOINT = "https://graph.zalo.me/v2.0/me/info";

export class ZaloLocationGateway implements LocationService {
  async decodeLocation(token: string, accessToken: string) {
    const ZALO_APP_SECRET = process.env.ZALO_APP_SECRET;
    if (!ZALO_APP_SECRET) {
      throw new Error("Server chưa được cấu hình ZALO_APP_SECRET.");
    }

    // Call Zalo Open API to decode location
    const zaloResponse = await fetch(ZALO_LOCATION_ENDPOINT, {
      method: "GET",
      headers: {
        access_token: accessToken,
        code: token,
        secret_key: ZALO_APP_SECRET,
      },
    });

    const bodyText = await zaloResponse.text();

    let rawPayload: { error?: number; message?: string; data?: { latitude?: number | string; longitude?: number | string } };
    try {
      rawPayload = JSON.parse(bodyText) as typeof rawPayload;
    } catch {
      throw new Error("INVALID_JSON");
    }

    if (!zaloResponse.ok || rawPayload?.error) {
      const errorMessage = rawPayload?.message || "Không thể giải mã token vị trí. Vui lòng thử lại hoặc kiểm tra cấu hình.";
      throw new Error(errorMessage);
    }

    const location = {
      lat: rawPayload?.data?.latitude != null ? Number(rawPayload.data.latitude) : undefined,
      lng: rawPayload?.data?.longitude != null ? Number(rawPayload.data.longitude) : undefined,
    };

    if (!Number.isFinite(location.lat) || !Number.isFinite(location.lng)) {
      throw new Error("Zalo Open API không trả về vị trí hợp lệ.");
    }

    // Reverse geocoding with Nominatim
    let address: string | undefined;
    try {
      const params = new URLSearchParams({
        lat: String(location.lat),
        lon: String(location.lng),
        format: "json",
      });

      const nominatimResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
        method: "GET",
        headers: {
          "User-Agent": "haisanngaymoi-backend/1.0",
          Accept: "application/json",
        },
      });

      if (nominatimResponse.ok) {
        try {
          const data = await nominatimResponse.json() as { display_name?: string };
          address = data.display_name ?? undefined;
        } catch (parseError) {
          console.warn("[ZaloLocationGateway] Reverse geocoding parse error", parseError);
        }
      } else {
        console.warn("[ZaloLocationGateway] Reverse geocoding failed", nominatimResponse.status);
      }
    } catch (error) {
      console.warn("[ZaloLocationGateway] Lỗi reverse geocoding", error);
    }

    return {
      location: {
        lat: location.lat!,
        lng: location.lng!,
      },
      address: address ?? null,
    };
  }
}
