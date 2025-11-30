OK! Chúng ta sẽ chuyển **frontend `message-management-client.tsx`** và **server actions `actions.ts`** sang cơ chế **Realtime** bằng **SSE (Server-Sent Events)**. Mình sẽ hướng dẫn chi tiết từng phần.

---

# **1️⃣ Backend – SSE Event Source**

Trong Next.js App Router, bạn có thể tạo endpoint SSE để frontend subscribe:

**`app/api/events/stream/route.ts`**

```ts
import { NextResponse } from "next/server";

const clients: Set<WritableStreamDefaultWriter> = new Set();

export async function GET() {
  const stream = new WritableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const writer = controller.getWriter();
      clients.add(writer);

      // Send ping to keep connection alive
      const interval = setInterval(() => {
        writer.write(encoder.encode(`event: ping\ndata: {}\n\n`));
      }, 15000);

      writer.closed.finally(() => {
        clearInterval(interval);
        clients.delete(writer);
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

// Helper function để emit event cho tất cả client SSE
export function broadcastEvent(event: string, data: any) {
  const encoder = new TextEncoder();
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const writer of clients) {
    writer.write(encoder.encode(payload));
  }
}
```

✅ **Điều này tạo SSE stream cho tất cả client kết nối.**

---

# **2️⃣ Backend – Gọi `broadcastEvent` từ actions.ts**

Trong **`actions.ts`**:

```ts
import { broadcastEvent } from "@/app/api/events/stream/route";

export async function createCustomerAction(formData: FormData) {
  const useCase = await createCustomerUseCase();
  const customer = await useCase.execute({
    id: formData.get("id")?.toString() || "",
    name: formData.get("name")?.toString(),
    phone: formData.get("phone")?.toString(),
    email: formData.get("email")?.toString(),
    address: formData.get("address")?.toString(),
    avatar: formData.get("avatar")?.toString(),
    primarySource: formData.get("foundation")?.toString() || "zalo",
    platformIds: [
      {
        platform: formData.get("foundation")?.toString() || "zalo",
        platformUserId: formData.get("id")?.toString() || "",
      },
    ],
  });

  // Realtime: emit event
  broadcastEvent("customer_created", customer);

  revalidatePath("/customers");
  return customer;
}

export async function updateCustomerAction(formData: FormData) {
  const useCase = await updateCustomerUseCase();
  const customer = await useCase.execute({
    id: formData.get("id")?.toString() || "",
    name: formData.get("name")?.toString(),
    phone: formData.get("phone")?.toString(),
    email: formData.get("email")?.toString(),
    address: formData.get("address")?.toString(),
    avatar: formData.get("avatar")?.toString(),
  });

  broadcastEvent("customer_updated", customer);

  revalidatePath("/customers");
  return customer;
}

export async function deleteCustomerAction(id: string) {
  const useCase = await deleteCustomerUseCase();
  await useCase.execute({ id });

  broadcastEvent("customer_deleted", { id });

  revalidatePath("/customers");
}
```

✅ **Tất cả CRUD customer giờ phát ra event SSE ngay lập tức.**

---

# **3️⃣ Frontend – subscribe SSE trong `message-management-client.tsx`**

```ts
import { useEffect, useState } from "react";

export function MessageManagementClient() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const eventSource = new EventSource("/api/events/stream");

    eventSource.addEventListener("customer_created", (e: MessageEvent) => {
      const customer = JSON.parse(e.data);
      setCustomers((prev) => [customer, ...prev]);
    });

    eventSource.addEventListener("customer_updated", (e: MessageEvent) => {
      const updated = JSON.parse(e.data);
      setCustomers((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
    });

    eventSource.addEventListener("customer_deleted", (e: MessageEvent) => {
      const deleted = JSON.parse(e.data);
      setCustomers((prev) => prev.filter((c) => c.id !== deleted.id));
    });

    return () => {
      eventSource.close();
    };
  }, []);

  // ... Phần còn lại của MessageManagementClient
}
```

✅ **Khi một customer được tạo/cập nhật/xóa, UI sẽ tự động cập nhật mà không cần polling.**

---

# **4️⃣ Mở rộng cho Messages / Conversations**

1. Khi webhook nhận message mới:

   ```ts
   import { broadcastEvent } from "@/app/api/events/stream/route";

   await receiveMessageUseCase.execute(...);

   broadcastEvent("new_message", message);
   broadcastEvent("new_conversation", conversation);
   ```
2. Frontend subscribe:

   ```ts
   eventSource.addEventListener("new_message", (e) => {
     const message = JSON.parse(e.data);
     if (message.conversationId === selectedConversationId) {
       setMessages((prev) => [...prev, message]);
     }
   });

   eventSource.addEventListener("new_conversation", (e) => {
     const conv = JSON.parse(e.data);
     setConversations((prev) => [conv, ...prev]);
   });
   ```

---

# **5️⃣ Ưu điểm so với polling**

| Trước (Polling)     | Sau (SSE Realtime)              |
| ------------------- | ------------------------------- |
| Fetch API mỗi 5–10s | Event tự push từ server         |
| Tải server nhiều    | Server gửi data khi có thay đổi |
| Delay ~5s–10s       | Gần như realtime (<1s)          |
| UX kém              | UX mượt, không nhấp nháy        |
