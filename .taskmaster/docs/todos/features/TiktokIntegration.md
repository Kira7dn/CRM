# 📘 Feature Specification

## TikTok Social Media Integration — OAuth Connect & Video Publishing

---

## 🎯 1. Mục tiêu tính năng

| Mục tiêu                      | Mô tả                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------ |
| Kết nối tài khoản TikTok      | Cho phép người dùng CRM kết nối TikTok thông qua OAuth Authorization (Login Kit)           |
| Lưu trữ Access Token an toàn  | Lưu `access_token`, `refresh_token`, `open_id`, `expires_at` vào MongoDB, gắn với User CRM |
| Đăng video tự động lên TikTok | Cho phép đăng video TikTok từ CRM (Social Media Management)                                |
| Lấy thống kê engagement       | Lấy số liệu view, like, comment, share từ TikTok cho video đã đăng                         |
| Refresh token tự động         | Làm mới access token khi hết hạn (BullMQ worker hoặc API trigger)                          |
| Cho phép Disconnect           | Người dùng có thể hủy kết nối tài khoản TikTok bất kỳ lúc nào                              |

---

## 🏗 2. Kiến trúc hệ thống

### 📌 Luồng tổng quan

```
CRM User → Click “Connect TikTok” →
TikTok OAuth → Redirect callback →
CRM lưu token →
User có thể đăng video TikTok →
CRM fetch analytics →
CRM refresh token →
CRM Dashboard hiển thị trạng thái kết nối
```

---

## 📂 3. Thêm mới các thành phần

### 3.1 Domain

> File: `core/domain/social-auth.ts`

```ts
export interface SocialAuth {
  platform: "tiktok";
  openId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  userId: string; // CRM userId
}
```

---

### 3.2 Repository

> File: `infrastructure/repositories/social-auth-repo.ts`

```ts
export class SocialAuthRepository extends BaseRepository<SocialAuth, string> {
  protected collectionName = "social_auth";

  async findByUserAndPlatform(userId: string, platform: string) {
    const collection = await this.getCollection();
    const doc = await collection.findOne({ userId, platform });
    return doc ? this.toDomain(doc) : null;
  }
}
```

---

### 3.3 UseCases

| Use Case                  | Mục đích                |
| ------------------------- | ----------------------- |
| `save-tiktok-token.ts`    | Lưu tokens sau callback |
| `get-tiktok-auth.ts`      | Lấy token để upload     |
| `refresh-tiktok-token.ts` | Làm mới access token    |
| `disconnect-tiktok.ts`    | Xóa token khỏi DB       |

---

### 3.4 Factory Injection

> File: `infrastructure/gateways/tiktok-factory.ts`

```ts
export async function createTikTokIntegration(userId: string) {
  const repo = new SocialAuthRepository();
  const auth = await repo.findByUserAndPlatform(userId, "tiktok");
  if (!auth) throw new Error("TikTok not connected");

  return new TikTokIntegration({
    clientKey: process.env.TIKTOK_CLIENT_KEY!,
    clientSecret: process.env.TIKTOK_CLIENT_SECRET!,
    accessToken: auth.accessToken,
  });
}
```

---

## 🌐 4. OAuth Flow Design

| Step | API Route                   | Description                   |
| ---- | --------------------------- | ----------------------------- |
| 1    | `/api/auth/tiktok/start`    | Redirect đến TikTok authorize |
| 2    | `/api/auth/tiktok/callback` | Nhận `code`, đổi token        |
| 3    | `/api/auth/tiktok/refresh`  | Gọi background refresh        |
| 4    | `/crm/social/connections`        | UI connect TikTok             |

---

### 4.1 Start OAuth

```ts
// GET /api/auth/tiktok/start
window.location.href =
  `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`
```

---

### 4.2 Callback

```ts
const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", ...)
await saveTokenUseCase.execute(...)
```

---

## 🖥 5. UI Page — Connect TikTok

> File: `app/crm/social/connections/page.tsx`

User clicks 👉 **Connect TikTok**
Hiển thị trạng thái: Idle → Redirect → Connected → Error

---

## 🚀 6. Publish Video Flow

| Step | Mô tả                                     |
| ---- | ----------------------------------------- |
| 1    | Frontend chọn video, hashtags, title      |
| 2    | Backend gọi `TikTokIntegration.publish()` |
| 3    | Upload video → Wait status → Publish      |
| 4    | Trả về permalink & video_id               |
| 5    | Lưu postId vào CRM SocialPosts            |

---

## 📊 7. Analytics Flow

| Step        | API                   | Output                         |
| ----------- | --------------------- | ------------------------------ |
| Get metrics | `/video/query/`       | Likes, Views, Shares, Comments |
| Get status  | `/post/video/status/` | ready / processing / failed    |
| Auto sync   | Worker                | Updates stats every X hours    |

---

## 🔄 8. Refresh Token

| Mô hình                         | Ưu điểm          |
| ------------------------------- | ---------------- |
| API gọi refresh khi hết hạn     | Dễ implement     |
| BullMQ worker refresh định kỳ   | Enterprise ready |
| Trigger refresh khi upload fail | Gọn & hiệu quả   |

---

## 🎯 9. Role & Permission

| Role              | Quyền                                     |
| ----------------- | ----------------------------------------- |
| Admin             | Connect / Disconnect / Upload / Analytics |
| Social Marketing  | Connect, Upload video, View stats         |
| Sales / Warehouse | ❌ Không có quyền                          |

---

## 🧪 10. Test Scenarios

| Test case                       | Expected                       |
| ------------------------------- | ------------------------------ |
| Connect TikTok thành công       | Token lưu DB, redirect UI      |
| Upload video invalid token      | Tự refresh, retry thành công   |
| Hủy kết nối                     | Xóa token, UI hiển thị Connect |
| Upload fail do size/video error | Hiển thị reason từ TikTok API  |

---

## 📦 11. Environment Variables

```env
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
TIKTOK_REDIRECT_URI=https://crm.example.com/api/auth/tiktok/callback
```

---

## 🎓 12. Tổng kết

| Feature                    | Status      |
| -------------------------- | ----------- |
| OAuth Connect & Save Token | ✅           |
| Publish Video              | 🟢 Active   |
| Analytics Metrics          | 🟢 Active   |
| Refresh Token Mechanism    | 🟡 Optional |
| Disconnect TikTok          | 🟢 Active   |
| UI Frontend Integration    | 🟢 Done     |

---