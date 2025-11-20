# 🧩 **PRD: CRM Đa Kênh Bán Hàng & CSKH**

### (Zalo OA + Facebook Page, tích hợp n8n automation, backend FastAPI, frontend Next.js)

---

## 1️⃣. **Tổng quan sản phẩm**

### 🎯 Mục tiêu

Xây dựng hệ thống **CRM đa kênh** giúp doanh nghiệp:

* Quản lý khách hàng (contacts), đơn hàng (deals), và chăm sóc khách hàng từ nhiều kênh (Zalo OA, Facebook Page, Web form...).
* Theo dõi, lưu trữ và tự động hoá quy trình bán hàng, chăm sóc khách.
* Gửi tin nhắn, chiến dịch, nhắc việc và thống kê hiệu quả.

### 🧠 Tư tưởng thiết kế

> “Đơn giản – Mở rộng được – Kết nối dễ dàng với nền tảng khác (n8n, AI, ERP)”

### 🧩 Hệ thống gồm 3 lớp:

| Layer             | Mục tiêu                                      | Công nghệ chính                                |
| ----------------- | --------------------------------------------- | ---------------------------------------------- |
| **Frontend (UI)** | Giao diện web CRM (bán hàng, CSKH, marketing) | **Next.js 15**, TailwindCSS, React Query       |
| **Backend (API)** | Xử lý dữ liệu, logic, xác thực, lưu trữ       | **FastAPI**, PostgreSQL, Redis, SQLModel       |
| **Automation**    | Nhận Webhook, xử lý auto-reply, phân bổ lead  | **n8n**, HTTP Nodes, Zalo/Facebook integration |

---

## 2️⃣. **Phạm vi MVP**

MVP tập trung vào 5 module chính:

| Module                   | Mục tiêu                                                    |
| ------------------------ | ----------------------------------------------------------- |
| 👥 **Contacts**          | Quản lý thông tin khách hàng đa kênh (Zalo, Facebook, form) |
| 💬 **Messages / Inbox**  | Xem và trả lời tin nhắn khách hàng                          |
| 💼 **Deals / Pipeline**  | Quản lý cơ hội bán hàng và trạng thái chốt đơn              |
| 🎯 **Tasks / Reminders** | Giao việc, nhắc follow-up, chăm khách                       |
| 📊 **Reports**           | Thống kê pipeline, hiệu suất sales, chuyển đổi              |

---

## 3️⃣. **Tính năng chi tiết**

### 3.1 👥 **Contacts**

* Tạo / sửa / xoá contact.
* Đồng bộ từ Zalo OA / Facebook Page / form web.
* Thông tin cơ bản: tên, điện thoại, email, nguồn, thẻ, note.
* Gắn liên hệ với **deal** và **tin nhắn**.
* Tự động gán sales phụ trách (qua workflow n8n).

---

### 3.2 💬 **Messages (Inbox đa kênh)**

* Nhận tin nhắn từ **Zalo OA** và **Facebook Page** (qua webhook n8n).
* Hiển thị hội thoại hợp nhất (theo contact).
* Gửi tin nhắn trả lời thủ công hoặc tự động.
* Gắn tag / note vào từng cuộc trò chuyện.
* Real-time cập nhật (qua WebSocket FastAPI).

---

### 3.3 💼 **Deals (Pipeline bán hàng)**

* Theo dõi các cơ hội bán hàng (stage: Lead → Proposal → Won/Lost).
* Liên kết contact, giá trị, sản phẩm quan tâm.
* Chuyển stage bằng drag & drop UI.
* Giao nhiệm vụ follow-up tự động khi tạo deal.
* Báo cáo pipeline: tổng giá trị, tỷ lệ chốt, thời gian trung bình.

---

### 3.4 📅 **Tasks**

* Tạo task: gọi lại, gửi báo giá, CSKH.
* Giao cho nhân viên, đặt deadline.
* Nhắc tự động qua email/Zalo.
* Tích hợp với n8n để sinh task từ automation.

---

### 3.5 📊 **Reports**

* Tổng hợp KPI theo user / team.
* Pipeline summary, conversion rate.
* Biểu đồ số lượng tin nhắn, lead mới, deals closed.
* Xuất CSV hoặc gửi định kỳ qua email (n8n schedule).

---

## 4️⃣. **Automation (n8n workflows)**

| Workflow             | Mô tả                       | Trigger                | Hành động                                    |
| -------------------- | --------------------------- | ---------------------- | -------------------------------------------- |
| **Inbound Zalo OA**  | Nhận tin nhắn từ Zalo OA    | Webhook Zalo → n8n     | Gọi API `/contacts/upsert`, lưu message      |
| **Inbound Facebook** | Nhận tin nhắn FB            | Webhook FB → n8n       | Gọi API `/contacts/upsert`, lưu message      |
| **Lead Routing**     | Phân bổ lead cho sales      | Contact created        | Gọi API `/tasks/create`, gán owner           |
| **Auto Reply**       | Gửi trả lời mẫu             | New message (lead mới) | Gọi Zalo API send message                    |
| **Daily Report**     | Báo cáo hoạt động hàng ngày | Schedule               | Gọi API `/reports/daily`, gửi email tổng hợp |

---

## 5️⃣. **Hệ thống tích hợp**

| Nền tảng          | Mục đích                   | Hình thức kết nối               |
| ----------------- | -------------------------- | ------------------------------- |
| **Zalo OA**       | Gửi/nhận tin nhắn          | Webhook + REST API              |
| **Facebook Page** | Messenger                  | Webhook + Graph API             |
| **n8n**           | Automation                 | HTTP API 2 chiều                |
| **PostgreSQL**    | CSDL chính                 | ORM SQLModel                    |
| **Redis**         | Cache / rate-limit / queue | `aioredis`                      |
| **MinIO / S3**    | Lưu file / media           | boto3 client                    |
| **FastAPI**       | Backend REST API           | core app                        |
| **Next.js**       | UI / frontend              | gọi API FastAPI                 |
| **NGINX**         | Reverse proxy              | static + route backend/frontend |

---

## 6️⃣. **Mô hình dữ liệu chính (Database Schema tóm tắt)**

```
User(id, name, email, role, password_hash)
Contact(id, name, phone, email, source, tags, owner_id)
Message(id, contact_id, channel, text, direction, timestamp, external_id)
Deal(id, contact_id, title, value, stage, status, owner_id, expected_close)
Task(id, contact_id, type, due_at, status, assignee_id)
Integration(id, type, config_json, access_token, refresh_token)
AuditLog(id, actor_id, action, resource, timestamp)
```

---

## 7️⃣. **API chính (FastAPI)**

| Endpoint                  | Method             | Mục đích                               |
| ------------------------- | ------------------ | -------------------------------------- |
| `/auth/login`             | POST               | Đăng nhập, trả JWT                     |
| `/contacts`               | GET / POST / PATCH | CRUD contacts                          |
| `/contacts/upsert`        | POST               | Tạo hoặc cập nhật contact từ webhook   |
| `/contacts/{id}/messages` | GET / POST         | Xem / gửi tin nhắn                     |
| `/deals`                  | GET / POST / PATCH | Quản lý pipeline                       |
| `/tasks`                  | GET / POST / PATCH | Giao việc, nhắc nhở                    |
| `/reports`                | GET                | Dashboard, thống kê                    |
| `/webhooks/{channel}`     | POST               | Nhận webhook từ n8n hoặc Zalo/Facebook |

---

## 8️⃣. **UI Design (Next.js + Tailwind)**

### 📋 Modules giao diện:

| Trang         | Thành phần chính                  |
| ------------- | --------------------------------- |
| **Dashboard** | KPI tổng, biểu đồ pipeline        |
| **Contacts**  | Danh sách, filter, form chi tiết  |
| **Inbox**     | Giao diện chat đa kênh (Zalo, FB) |
| **Deals**     | Board pipeline dạng Kanban        |
| **Tasks**     | Lịch và danh sách công việc       |
| **Reports**   | Dashboard thống kê                |

### 🎨 Design system:

* UI library: shadcn/ui + Tailwind + Heroicons.
* Theme: sáng, xanh dương chủ đạo.
* Component tái sử dụng: Card, Table, Modal, Form, ChatBox.

---

## 9️⃣. **Phiên bản phát triển**

| Phiên bản      | Phạm vi                                                  | Ghi chú               |
| -------------- | -------------------------------------------------------- | --------------------- |
| **v1.0 (MVP)** | Contacts, Inbox (Zalo + FB), Deals cơ bản, Task, Reports | Triển khai thử nghiệm |
| **v1.1**       | Auto Reply, Lead Routing, Schedule Reports (n8n)         | Mở rộng automation    |
| **v1.2**       | AI Assistant (tự động tóm tắt hội thoại)                 | Tích hợp GPT hoặc LLM |
| **v2.0**       | Multi-tenant, RBAC nâng cao, marketing campaign          | Hướng SaaS mở rộng    |

---

## 🔟. **Triển khai & Hạ tầng**

| Thành phần          | Cấu hình                                                          |
| ------------------- | ----------------------------------------------------------------- |
| **Server**          | Ubuntu 22.04, 2vCPU, 4GB RAM (EC2 / VPS)                          |
| **Docker services** | `backend`, `frontend`, `n8n`, `postgres`, `redis`, `nginx`        |
| **CI/CD**           | GitHub Actions: build image → push registry → auto pull + restart |
| **Domain / SSL**    | NGINX + Certbot, cấu hình subdomain cho frontend/backend/n8n      |
| **Monitoring**      | Grafana + Prometheus (API latency, message flow)                  |
| **Logs**            | Loki / JSON logs qua Docker                                       |

---

## 1️⃣1️⃣. **Non-functional requirements**

| Loại              | Yêu cầu                                             |
| ----------------- | --------------------------------------------------- |
| Hiệu năng         | Tối thiểu 1000 contacts, 100 concurrent requests    |
| Bảo mật           | JWT + HTTPS + RBAC                                  |
| Khả năng mở rộng  | Có thể tách backend/frontend/n8n thành microservice |
| Dễ bảo trì        | Config qua `.env`, Dockerized hoàn toàn             |
| Khả năng tích hợp | REST API và Webhook 2 chiều                         |

---

## 1️⃣2️⃣. **Rủi ro & Giải pháp**

| Rủi ro                      | Biện pháp                                  |
| --------------------------- | ------------------------------------------ |
| Token Zalo/Facebook hết hạn | n8n tự động refresh token                  |
| Quá tải webhook             | Redis queue / rate-limit                   |
| Trùng contact               | Logic `upsert` qua phone/external_id       |
| CSKH không bắt kịp lead mới | Workflow “notify lead” tự động             |
| Dữ liệu thất lạc            | Backup DB hàng ngày, S3 object replication |

---

## ✅ **Tóm tắt định hướng kiến trúc**

> Next.js = UI
> FastAPI = Logic & Data
> n8n = Automation brain
> PostgreSQL = Core data
> Redis = Realtime + queue
> Zalo/Facebook = Channels

---