# Content Scheduler - TODO

## Yêu cầu
- [ ] Thay đổi `PostList.tsx` thành `PostScheduler.tsx` sử dụng calendar component
- [ ] Hiển thị posts trên calendar theo ngày scheduled
- [ ] Click vào ngày → create/edit post (nếu chưa publish hoặc quá hạn)
- [ ] Calendar chỉ hiển thị view tháng (month view)
- [ ] Mỗi ngày có thể có 1-2 posts
- [ ] Mỗi post chỉ nằm trong 1 ngày

## Implementation Steps

1. **Rename và setup PostScheduler component**
   - Rename `PostList.tsx` → `PostScheduler.tsx`
   - Import FullCalendar: `@fullcalendar/react`, `@fullcalendar/daygrid`
   - Setup calendar với `initialView: "dayGridMonth"`

2. **Transform posts thành calendar events**
   - Map `Post[]` → calendar events format:
     - `id`: post.id
     - `title`: post.title
     - `start`: post.scheduledAt || post.createdAt
     - `backgroundColor`: platform colors
     - `extendedProps`: { post: Post }

3. **Handle date click**
   - `dateClick` → open PostForm modal với `scheduledAt` = clicked date
   - Kiểm tra post status: `post.platforms.some(p => p.status === "published")` → đã publish
   - Nếu chưa publish (tất cả platforms là "draft" hoặc "scheduled") → cho phép edit
   - Nếu có platform published → chỉ xem, không edit

4. **Update Post domain (nếu cần)**
   - Đảm bảo `scheduledAt` là required field trong PostForm khi dùng scheduler
