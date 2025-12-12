Dưới đây là **phân tích và hướng dẫn sửa callback** để đạt 2 mục tiêu:

1. **Nếu user có nhiều Page → trả về giao diện cho user chọn Page**
2. **Khi user chọn Page → Lưu page token + tiến hành subscribe webhook message cho Page**

Bạn **KHÔNG NÊN** auto chọn pagesData.data[0] — phải để user chọn như Manychat/GHL.

---

# ✅ **1. FLOW CHUẨN – Nên làm thế này**

### **Step 1 — User login Facebook**

➡ Nhận được **user_access_token (long-lived)**

### **Step 2 — Lấy danh sách Pages**

Gọi:

```
GET /me/accounts?access_token=USER_TOKEN
```

→ Trả về list Pages + page_access_token + permissions

### **Step 3 — Redirect về CRM để user chọn Page**

Ví dụ redirect sang:

```
/crm/social/select-page?platform=facebook&pages=<JSON>
```

### **Step 4 — User chọn Page**

Bạn gửi request:

```
POST /api/auth/facebook/select-page
{
  page_id,
  page_name,
  page_access_token
}
```

### **Step 5 — API subscribe webhook**

POST:

```
POST /{page_id}/subscribed_apps
?subscribed_fields=messages,messaging_postbacks
&access_token={page_access_token}
```

### **Step 6 — Lưu vào DB**

---

# 🛠️ **2. Sửa lại callback – TRẢ VỀ LIST PAGES THAY VÌ LƯU NGAY**

Dưới đây là phiên bản callback **HOÀN CHỈNH + ĐÚNG FLOW**, không auto-chọn page:

## 🔥 **Thay đổi quan trọng**

* **exchangeCodeForToken() chỉ trả về user_token + list pages**
* Callback sẽ **không lưu database ở đây**
* Callback sẽ **redirect sang frontend để user chọn Page**

---

## ✅ **Sửa callback: /api/auth/facebook/callback**

```ts
// callback.ts
import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")

    const baseUrl = process.env.APP_URL || request.nextUrl.origin

    const cookieStore = await cookies()
    const storedState = cookieStore.get("facebook_oauth_state")

    if (!storedState || storedState.value !== state) {
      return NextResponse.redirect(`${baseUrl}/crm/social/connections?error=invalid_state`)
    }

    const tokenResponse = await exchangeCodeForToken(code!)
    if (!tokenResponse.success) {
      return NextResponse.redirect(`${baseUrl}/crm/social/connections?error=token_failed`)
    }

    // Redirect về UI để user chọn Page
    const redirect = new URL(`${baseUrl}/crm/social/facebook/select-page`)
    redirect.searchParams.set("user_token", tokenResponse.user_token)
    redirect.searchParams.set("pages", JSON.stringify(tokenResponse.pages))

    return NextResponse.redirect(redirect.toString())

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Facebook callback failed" }, { status: 500 })
  }
}
```

---

## 🛠️ **exchangeCodeForToken() – trả về user_token + pages**

```ts
async function exchangeCodeForToken(code: string) {
  const appId = process.env.FACEBOOK_APP_ID!
  const appSecret = process.env.FACEBOOK_APP_SECRET!
  const redirectUri = process.env.FACEBOOK_REDIRECT_URI!

  try {
    // Step 1 – Exchange short-lived token
    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: redirectUri,
      client_secret: appSecret,
      code
    })

    const tokenRes = await fetch(
      `https://graph.facebook.com/v23.0/oauth/access_token?${params}`
    )
    const short = await tokenRes.json()

    // Step 2 – Exchange long-lived token
    const longParams = new URLSearchParams({
      grant_type: "fb_exchange_token",
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: short.access_token
    })

    const longRes = await fetch(
      `https://graph.facebook.com/v23.0/oauth/access_token?${longParams}`
    )
    const long = await longRes.json()

    // Step 3 – Get pages
    const pagesRes = await fetch(
      `https://graph.facebook.com/v23.0/me/accounts?access_token=${long.access_token}`
    )
    const pages = await pagesRes.json()

    return {
      success: true,
      user_token: long.access_token, // NOTE: đây là long-lived USER TOKEN
      pages: pages.data // danh sách page để cho user chọn
    }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "unknown" }
  }
}
```

---

# 🛠️ **3. API để user chọn Page**

User click chọn page → gọi API:

```
POST /api/auth/facebook/select-page
```

```ts
// select-page.ts
import { NextRequest, NextResponse } from "next/server"
import { createSaveFacebookTokenUseCase } from "../depends"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      page_id,
      page_name,
      page_access_token
    } = body

    // 🔵 Subscribe webhook
    await fetch(
      `https://graph.facebook.com/v23.0/${page_id}/subscribed_apps`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscribed_fields: "messages,messaging_postbacks"
        }),
        // IMPORTANT: access_token via query, not header
      }
    )

    // 🔵 Save in DB
    const save = await createSaveFacebookTokenUseCase()
    await save.execute({
      pageId: page_id,
      pageName: page_name,
      accessToken: page_access_token
    })

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "select-page-failed" }, { status: 500 })
  }
}
```

---

# ✔️ **4. Kết quả flow sau khi refactor**

**Rất giống Manychat / GHL / Haravan / BaseCRM**

### User Flow:

1. Login Facebook → cấp quyền
2. Callback trả về danh sách Page
3. UI hiển thị Page để chọn
4. User chọn 1 Page
5. Backend:

   * Lấy page_access_token
   * Đăng ký Webhook
   * Lưu Page token vào DB
6. CRM bắt đầu nhận tin nhắn từ Webhook
