# Improve Input Post - TODO

## Mục tiêu
Cải thiện input cho LLM để tạo **Post Idea Schedule** (kế hoạch 1 tháng) và **Post Content** chất lượng hơn.

---

## TODO List

### Phase 1: Update Domain Models
- [ ] **1.1** Update `Product` domain - thêm `url: string` field
- [ ] **1.2** Update `BrandMemory` domain - đổi `productDescription` → `brandDescription`, thêm `contentsInstruction`, `selectedProductIds`

### Phase 2: Update PostContentSettings UI
- [ ] **2.1** Update `PostContentSettings.tsx` - đổi productDescription → brandDescription
- [ ] **2.2** Thêm Product Selector vào PostContentSettings (multi-select từ danh sách products)
- [ ] **2.3** Thêm `contentsInstruction` textarea vào PostContentSettings

### Phase 3: Create Post Idea Schedule Feature
- [ ] **3.1** Tạo `GeneratePostScheduleUseCase` - AI generate kế hoạch 1 tháng
- [ ] **3.2** Tạo button "Lên kế hoạch Post" trong `posts/page.tsx`
- [ ] **3.3** Hiển thị kết quả schedule và cho phép lưu vào scheduler

### Phase 4: Update PostForm
- [ ] **4.1** Thêm `idea` field vào PostForm (editable, từ schedule)
- [ ] **4.2** Thêm Product Dropdown (0-1 product) vào PostForm
- [ ] **4.3** Thêm `detailContentsInstruction` textarea vào PostForm
- [ ] **4.4** Update generate logic sử dụng idea + product + detailInstruction

---

## Implementation

### Phase 1.1: Update Product Domain

**File: `core/domain/catalog/product.ts`** (UPDATE)

Add `url` field to Product constructor.

### Phase 1.2: Update BrandMemory Domain

**File: `core/domain/brand-memory.ts`** (UPDATE)

Rename `productDescription` to `brandDescription`, add `contentsInstruction` and `selectedProductIds`.

### Phase 2: PostContentSettings Updates

**File: `app/(features)/crm/campaigns/posts/_components/PostContentSettings.tsx`** (UPDATE)

- Change productDescription → brandDescription
- Add multi-select product picker
- Add contentsInstruction textarea

### Phase 3: Post Schedule Generation

**File: `core/application/usecases/marketing/post/generate-post-schedule.ts`** (NEW)

Generate 20-30 post ideas for 1 month based on brand context.

**File: `app/api/content-generation/schedule/route.ts`** (NEW)

API endpoint for schedule generation.

### Phase 4: PostForm Enhancements

**File: `app/(features)/crm/campaigns/posts/_components/PostForm.tsx`** (UPDATE)

- Add idea field (pre-filled from schedule)
- Add product dropdown (0-1 selection)
- Add detailContentsInstruction field
- Pass product URL to LLM for content generation

---

## Notes

**Scope:**
- Input improvement ONLY
- NO complex scheduler UI
- NO auto-publishing
- Focus: better input → better LLM output
