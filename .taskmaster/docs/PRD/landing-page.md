# 🌊 Hướng Dẫn Thiết Kế Landing Page - Ngày Mới Cô Tô

## Mục lục
1. [Tổng quan & Chiến lược](#1-tổng-quan--chiến-lược)
2. [Kiến trúc trang](#2-kiến-trúc-trang)
3. [Section 1: Hero](#3-section-1-hero)
4. [Section 2: Đề xuất giá trị](#4-section-2-đề-xuất-giá-trị)
5. [Section 3: Sản phẩm nổi bật](#5-section-3-sản-phẩm-nổi-bật)
6. [Section 4: Truy xuất nguồn gốc](#6-section-4-truy-xuất-nguồn-gốc)
7. [Section 5: Giới thiệu Cô Tô](#7-section-5-giới-thiệu-cô-tô)
8. [Section 6: Bền vững](#8-section-6-bền-vững)
9. [Section 7: CSR & Tác động](#9-section-7-csr--tác-động)
10. [Section 8: Đánh giá khách hàng](#10-section-8-đánh-giá-khách-hàng)
11. [Section 9: CTA cuối](#11-section-9-cta-cuối)
12. [Section 10: Footer](#12-section-10-footer)
13. [Thông số kỹ thuật](#13-thông-số-kỹ-thuật)
14. [Tối ưu mobile](#14-tối-ưu-mobile)
15. [Performance & SEO](#15-performance--seo)

---

## 1. Tổng quan & Chiến lược

### 1.1. Mục tiêu Landing Page

**Mục tiêu chính:** Chuyển đổi khách truy cập → Khách mua hàng lần đầu

**Mục tiêu phụ:**
- Xây dựng lòng tin thông qua sự minh bạch
- Giáo dục về chất lượng hải sản Cô Tô
- Truyền tải giá trị thương hiệu (bền vững, cộng đồng)
- Thu thập email leads

### 1.2. Đối tượng mục tiêu

**Chính:** Persona 1 - Minh (Người tiêu dùng ý thức)
- Tuổi 28-40, đô thị, quan tâm sức khỏe
- Coi trọng tính minh bạch và chất lượng
- Sẵn sàng trả giá cao hơn

**Phụ:** Persona 3 - Lan (Mẹ bỉm)
- Cần sự tiện lợi và an toàn
- Ít thời gian, muốn thông tin nhanh

### 1.3. Hành trình người dùng trên Landing Page

```
Vào trang → Hero (Lôi cuốn) 
         → Đề xuất giá trị (Tại sao chọn chúng tôi?) 
         → Sản phẩm (Bán gì?) 
         → Truy xuất (Xây dựng lòng tin) 
         → Câu chuyện Cô Tô (Kết nối cảm xúc) 
         → Bền vững (Gắn kết giá trị) 
         → Tác động CSR (Cảm giác tốt) 
         → Đánh giá (Xác thực) 
         → CTA cuối (Chuyển đổi) 
         → Footer (Thông tin)
```

**Mục tiêu độ sâu cuộn:** 70%  
**Tỷ lệ chuyển đổi mục tiêu:** 3-5% (khách mới)

---

## 2. Kiến trúc trang

### 2.1. Dòng chảy & Thứ bậc các Section

| # | Section | Mục đích | % Cuộn | Ưu tiên |
|---|---------|----------|--------|---------|
| 1 | Hero | Lôi cuốn + Giá trị nhanh | 0-10% | QUAN TRỌNG NHẤT |
| 2 | Đề xuất giá trị | Tại sao chọn chúng tôi (3 trụ cột) | 10-20% | CAO |
| 3 | Sản phẩm | Chúng tôi bán gì | 20-35% | CAO |
| 4 | Truy xuất | USP - Hệ thống QR | 35-45% | QUAN TRỌNG NHẤT |
| 5 | Nguồn gốc Cô Tô | Kể chuyện | 45-60% | TRUNG BÌNH |
| 6 | Bền vững | Quy trình & giá trị | 60-75% | TRUNG BÌNH |
| 7 | Tác động CSR | Bằng chứng xã hội (số liệu) | 75-85% | TRUNG BÌNH |
| 8 | Đánh giá | Tín hiệu tin cậy | 85-90% | CAO |
| 9 | CTA cuối | Chuyển đổi | 90-95% | QUAN TRỌNG NHẤT |
| 10 | Footer | Thông tin + Pháp lý | 95-100% | THẤP |

### 2.2. Độ rộng trang & Hệ thống Grid

**Độ rộng container:**
- Section toàn màn hình: 100vw
- Nội dung tối đa: 1200px (canh giữa)
- Văn bản tối đa: 720px (dễ đọc)
- Grid: 12 cột, khoảng cách 24px

**Khoảng cách dọc:**
- Giữa các section: 120px (desktop), 80px (mobile)
- Trong section: 60px (desktop), 40px (mobile)
- Giữa các phần tử: 24px (desktop), 16px (mobile)

---

## 3. Section 1: HERO

### 3.1. Mục tiêu
- Lôi cuốn khách trong **3 giây đầu**
- Truyền tải đề xuất giá trị cốt lõi
- Thiết lập vị thế cao cấp
- Thúc đẩy hành động ngay hoặc cuộn xuống

### 3.2. Wireframe Layout

```
┌────────────────────────────────────────────────────┐
│  [HEADER/NAV: Logo | Sản phẩm | Về chúng tôi | LH] │
├────────────────────────────────────────────────────┤
│                                                    │
│  [VIDEO/ẢNH NỀN TOÀN MÀN HÌNH]                     │
│  ┌──────────────────────────────────┐             │
│  │  HƯƠNG VỊ BIỂN BẮC                │             │
│  │  Tươi từ Cô Tô đến bàn ăn         │             │
│  │                                    │             │
│  │  Hải sản cao cấp • Minh bạch 100% │             │
│  │  • 1% cho Biển Xanh               │             │
│  │                                    │             │
│  │  [CTA: Xem sản phẩm ngay]         │             │
│  │  [CTA phụ: Truy xuất nguồn gốc]  │             │
│  │                                    │             │
│  └──────────────────────────────────┘             │
│                                                    │
│  [Scroll indicator: Mũi tên xuống]                │
└────────────────────────────────────────────────────┘
```

### 3.3. Nội dung chi tiết

#### **A. Background (Nền)**

**Option 1: Video (Ưu tiên)**
- **Nội dung:** Tàu đánh cá ra khơi lúc bình minh, sóng biển, ngư dân kéo lưới
- **Độ dài:** 15-20 giây, loop
- **Định dạng:** MP4, H.264, 1920×1080
- **Dung lượng:** Tối đa 3MB (compress heavy)
- **Fallback:** Ảnh tĩnh cho mobile/slow connection
- **Overlay:** Gradient đen nhẹ (opacity 40%) để text rõ

**Option 2: Ảnh tĩnh (Fallback)**
- **Nội dung:** Ngư dân trên tàu giơ hải sản tươi, bình minh Cô Tô
- **Độ phân giải:** 2560×1440 (retina-ready)
- **Định dạng:** WebP (primary), JPG (fallback)
- **Filter:** Cool tone, slight blue tint, high contrast

#### **B. Headline (Tiêu đề chính)**

**Text:**
```
HƯƠNG VỊ BIỂN BẮC
Tươi từ Cô Tô đến bàn ăn
```

**Typography:**
- Font: Montserrat Bold
- Size: 56px / 3.5rem (desktop), 36px / 2.25rem (mobile)
- Line height: 1.2
- Color: #FFFFFF (White)
- Text shadow: 0 2px 8px rgba(0,0,0,0.3) (để nổi bật)
- Letter spacing: -1%

**Animation:** Fade in + slide up, delay 0.3s, duration 0.8s

#### **C. Subheadline (Tiêu đề phụ)**

**Text:**
```
Hải sản cao cấp • Minh bạch 100% • 1% cho Biển Xanh
```

**Typography:**
- Font: Inter Regular
- Size: 20px / 1.25rem (desktop), 16px / 1rem (mobile)
- Color: #F4EBDD (Sand - softer than pure white)
- Separator: Bullet point (•) với color #1CE7ED (Crystal Sea)

**Animation:** Fade in, delay 0.6s, duration 0.8s

#### **D. CTA Buttons**

**Primary CTA:**
```
[Xem sản phẩm ngay →]
```
- Background: #FADE3F (Golden Dawn)
- Text: #2B2B2B (Charcoal), Montserrat SemiBold, 18px
- Padding: 16px 40px
- Border radius: 8px
- Hover: Background lighten 10%, slight scale (1.05)
- Shadow: 0 4px 16px rgba(250, 222, 63, 0.4)

**Secondary CTA:**
```
[Truy xuất nguồn gốc]
```
- Background: transparent
- Border: 2px solid #FFFFFF
- Text: #FFFFFF, Inter Medium, 16px
- Padding: 14px 32px
- Border radius: 8px
- Hover: Background rgba(255,255,255,0.1)

**Layout:**
- Desktop: Nằm ngang, cách nhau 16px
- Mobile: Xếp dọc, full width, cách nhau 12px

#### **E. Trust Badges (Huy hiệu tin cậy)**

**Vị trí:** Dưới CTAs, canh giữa

**Nội dung:**
```
[Icon ✓] Truy xuất 100%    [Icon ❄️] Tươi <30 phút    [Icon ♻️] Bền vững
```

**Styling:**
- Icons: 24×24px, color #1CE7ED
- Text: Inter Regular, 14px, #FFFFFF, opacity 90%
- Layout: Inline, cách nhau 32px (desktop), wrap trên mobile

#### **F. Scroll Indicator**

**Vị trí:** Bottom center, cách đáy 40px

**Design:**
- Animated chevron down (bounce animation)
- Color: #FFFFFF, opacity 60%
- Size: 32×32px
- Animation: Bounce infinite, duration 2s

### 3.4. Responsive Behavior

**Desktop (>1200px):**
- Hero height: 100vh (full screen)
- Content centered vertically & horizontally

**Tablet (768px - 1199px):**
- Hero height: 80vh
- Font sizes scale down 85%

**Mobile (<768px):**
- Hero height: 100vh (để ấn tượng)
- Video tắt, dùng ảnh (performance)
- Text size giảm còn 64% (như spec ở trên)
- CTAs full width, stack vertical

### 3.5. Performance

**Video:**
- Lazy load: Video chỉ load khi vào viewport
- Autoplay: muted (để browsers cho phép)
- Preload: metadata only
- Poster image: Có để hiện ngay

**Image:**
- Lazy load: Yes (except hero vì above fold)
- Srcset: Multiple sizes cho responsive
- Format: WebP với JPG fallback

---

## 4. Section 2: ĐỀ XUẤT GIÁ TRỊ

### 4.1. Mục tiêu
- Trả lời câu hỏi: "Tại sao chọn Ngày Mới?"
- Làm nổi bật 3 trụ cột thương hiệu
- Xây dựng sự khác biệt so với đối thủ

### 4.2. Wireframe Layout

```
┌────────────────────────────────────────────────────┐
│                                                    │
│              [SECTION HEADING]                     │
│         Tại sao chọn Ngày Mới - Cô Tô?            │
│                                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ [Icon 1] │  │ [Icon 2] │  │ [Icon 3] │        │
│  │          │  │          │  │          │        │
│  │ MINH BẠCH│  │ HƯƠNG VỊ │  │ TÁC ĐỘNG │        │
│  │          │  │  ĐẶC BIỆT│  │ TÍCH CỰC │        │
│  │ Mỗi sản  │  │ Biển lạnh│  │ 1% doanh │        │
│  │ phẩm có  │  │ tạo nên  │  │ thu cho  │        │
│  │ mã truy  │  │ vị ngọt  │  │ Quỹ Biển │        │
│  │ xuất QR  │  │ tự nhiên │  │ Sạch     │        │
│  │          │  │          │  │          │        │
│  │ [Link]   │  │ [Link]   │  │ [Link]   │        │
│  └──────────┘  └──────────┘  └──────────┘        │
│                                                    │
└────────────────────────────────────────────────────┘
```

### 4.3. Nội dung chi tiết

#### **A. Section Heading**

**Text:**
```
Tại sao chọn Ngày Mới - Cô Tô?
```

**Typography:**
- Font: Montserrat SemiBold
- Size: 40px / 2.5rem (desktop), 28px / 1.75rem (mobile)
- Color: #2B2B2B (Charcoal)
- Align: Center
- Margin bottom: 60px (desktop), 40px (mobile)

**Optional subheading:**
```
Ba cam kết làm nên sự khác biệt
```
- Font: Inter Regular
- Size: 18px / 1.125rem
- Color: #666666
- Margin top: 16px

#### **B. Value Prop Cards (3 cột)**

**Layout:**
- Desktop: 3 cards ngang, equal width, gap 32px
- Tablet: 3 cards, slightly smaller gap
- Mobile: Stack dọc, full width

**Card structure:**

##### **Card 1: MINH BẠCH**

```
┌─────────────────────────┐
│      [Icon QR]          │
│      (64×64px)          │
│                         │
│      MINH BẠCH          │
│      Biết nguồn gốc     │
│      Yên tâm chọn       │
│                         │
│   Mỗi sản phẩm có mã    │
│   QR truy xuất đầy đủ:  │
│   tàu, ngư dân, vùng,   │
│   thời gian khai thác.  │
│                         │
│   [→ Tìm hiểu thêm]     │
└─────────────────────────┘
```

**Styling:**
- Background: #FFFFFF (White)
- Border: 1px solid #E5E5E5
- Border radius: 16px
- Padding: 40px (desktop), 32px (mobile)
- Hover: Shadow lift effect
  - Box-shadow: 0 8px 24px rgba(28, 231, 237, 0.15)
  - Transform: translateY(-4px)
  - Transition: 0.3s ease

**Icon:**
- Style: Line icon, 2px stroke
- Color: #1CE7ED (Crystal Sea)
- Size: 64×64px
- Background circle (optional): #1CE7ED opacity 10%, 80×80px

**Heading:**
- Font: Montserrat Bold
- Size: 24px / 1.5rem
- Color: #2B2B2B
- Margin: 24px 0 8px 0

**Tagline:**
- Font: Inter Medium
- Size: 16px / 1rem
- Color: #1CE7ED
- Margin bottom: 16px

**Body text:**
- Font: Inter Regular
- Size: 16px / 1rem
- Line height: 1.6
- Color: #666666

**Link:**
- Font: Inter Medium
- Size: 14px
- Color: #1CE7ED
- Hover: Underline
- Icon: Arrow right (→)

##### **Card 2: HƯƠNG VỊ ĐẶC BIỆT**

```
┌─────────────────────────┐
│      [Icon Wave]        │
│      (64×64px)          │
│                         │
│   HƯƠNG VỊ ĐẶC BIỆT     │
│   Ngọt thanh tự nhiên   │
│                         │
│   Cô Tô có nước biển    │
│   lạnh 18-22°C - lạnh   │
│   nhất Việt Nam. Hải    │
│   sản chắc thịt, ngọt   │
│   tự nhiên, ít tanh.    │
│                         │
│   [→ Khám phá Cô Tô]    │
└─────────────────────────┘
```

**Icon:** Sóng biển stylized, color #1CE7ED

**Tagline:** "Ngọt thanh tự nhiên"

##### **Card 3: TÁC ĐỘNG TÍCH CỰC**

```
┌─────────────────────────┐
│      [Icon Heart]       │
│      (64×64px)          │
│                         │
│   TÁC ĐỘNG TÍCH CỰC     │
│   Mua là giúp           │
│                         │
│   1% doanh thu đóng góp │
│   vào Quỹ Biển Sạch Cô  │
│   Tô. Bảo vệ đại dương, │
│   hỗ trợ ngư dân.       │
│                         │
│   [→ Xem tác động]      │
└─────────────────────────┘
```

**Icon:** Trái tim + sóng, color #1CE7ED

**Tagline:** "Mua là giúp"

#### **C. Background & Spacing**

**Section background:**
- Color: #F4EBDD (Sand) - softer than pure white
- Alternative: White với subtle wave pattern (opacity 3%)

**Padding:**
- Top/Bottom: 100px (desktop), 60px (mobile)
- Left/Right: Container padding (auto centered, max-width 1200px)

### 4.4. Animation (Khi scroll vào view)

**Cards:**
- Fade in + slide up
- Stagger: Card 1 (delay 0s), Card 2 (delay 0.2s), Card 3 (delay 0.4s)
- Duration: 0.6s
- Easing: ease-out

**Trigger:** Khi 20% section vào viewport

---

## 5. Section 3: SẢN PHẨM NỔI BẬT

### 5.1. Mục tiêu
- Showcase sản phẩm hero (best sellers)
- Thúc đẩy click vào trang sản phẩm
- Thể hiện đa dạng sản phẩm

### 5.2. Wireframe Layout

```
┌────────────────────────────────────────────────────┐
│                                                    │
│           [SECTION HEADING]                        │
│      Hải sản tươi hôm nay từ Cô Tô                │
│                                                    │
│  [Slider controls: ← →]                           │
│                                                    │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  │
│  │ [Img1] │  │ [Img2] │  │ [Img3] │  │ [Img4] │  │
│  │        │  │        │  │        │  │        │  │
│  │ Cá     │  │ Tôm    │  │ Mực    │  │ Ghẹ    │  │
│  │ Tuyết  │  │ Hùm    │  │ Ống    │  │ Xanh   │  │
│  │        │  │        │  │        │  │        │  │
│  │ 450k   │  │ 1.2M   │  │ 280k   │  │ 380k   │  │
│  │        │  │        │  │        │  │        │  │
│  │[+ Giỏ] │  │[+ Giỏ] │  │[+ Giỏ] │  │[+ Giỏ] │  │
│  └────────┘  └────────┘  └────────┘  └────────┘  │
│                                                    │
│       [CTA: Xem tất cả sản phẩm →]                │
│                                                    │
└────────────────────────────────────────────────────┘
```

### 5.3. Nội dung chi tiết

#### **A. Section Heading**

**Text:**
```
Hải sản tươi hôm nay từ Cô Tô
```

**Subheading (optional):**
```
Đánh bắt sáng nay • Giao trong 24h • Truy xuất 100%
```

**Typography:**
- Heading: Montserrat SemiBold, 40px, #2B2B2B
- Subheading: Inter Regular, 16px, #666666, badges với separator

#### **B. Product Cards**

**Hiển thị:**
- Desktop: 4 cards (có thể scroll nếu nhiều hơn)
- Tablet: 3 cards visible
- Mobile: 1-2 cards, swipeable carousel

**Card structure:**

```
┌─────────────────────────┐
│   [Product Image]       │
│   (Square, 280×280px)   │
│                         │
│   [Badge: Premium/New]  │
│                         │
│   CÁ TUYẾT CÔ TÔ        │
│   Fillet tươi - 500g    │
│                         │
│   ⭐ 4.9 (120)          │
│                         │
│   450,000₫              │
│                         │
│   ✓ Truy xuất   ✓ Tươi │
│                         │
│   [Thêm vào giỏ]        │
└─────────────────────────┘
```

**Styling:**

**Card container:**
- Background: #FFFFFF
- Border: 1px solid #E5E5E5
- Border radius: 12px
- Padding: 16px
- Hover: 
  - Shadow: 0 8px 24px rgba(0,0,0,0.08)
  - Transform: translateY(-4px)
  - Transition: 0.3s

**Image:**
- Aspect ratio: 1:1 (square)
- Object-fit: cover
- Border radius: 8px (top corners only hoặc all)
- Background: #F4EBDD (loading state)
- Hover: Slight zoom (scale 1.05) với overflow hidden

**Badge (nếu có):**
- Vị trí: Absolute, top-right của image
- Background: #ED1CA8 (Vivid Coral) cho "Mới", #FADE3F cho "Bán chạy"
- Text: White, Inter Bold, 10px, uppercase
- Padding: 4px 8px
- Border radius: 4px

**Product Name:**
- Font: Montserrat SemiBold
- Size: 18px / 1.125rem
- Color: #2B2B2B
- Margin: 12px 0 4px 0
- Max lines: 2 (ellipsis nếu dài)

**Product Subtitle:**
- Font: Inter Regular
- Size: 14px
- Color: #666666
- Margin bottom: 8px

**Rating:**
- Star icon: ⭐ (yellow, 16px)
- Number: Inter Medium, 14px, #2B2B2B
- Review count: Inter Regular, 14px, #999999, in parentheses

**Price:**
- Font: Montserrat Bold
- Size: 24px / 1.5rem
- Color: #2B2B2B
- Margin: 8px 0

**Trust badges (icons nhỏ):**
- ✓ Truy xuất   ✓ Tươi <30'
- Font: Inter Regular, 12px, #666666
- Icon: 14×14px, color #1CE7ED

**CTA Button (Thêm vào giỏ):**
- Full width trong card
- Background: #1CE7ED (Crystal Sea)
- Text: #FFFFFF, Inter SemiBold, 14px
- Padding: 12px
- Border radius: 6px
- Hover: Background darken 10%, scale 1.02
- Icon: Cart icon (shopping-cart)

**Alternative: Link instead of button:**
```
[Xem chi tiết →]
```
- Text link style, #1CE7ED, hover underline

#### **C. Slider/Carousel Controls**

**Desktop:**
- Arrow buttons: Left & Right
- Position: Absolute, vertically centered, outside cards
- Style: Circle buttons, 48×48px, background #FFFFFF, shadow
- Icon: Chevron, #2B2B2B
- Hover: Background #1CE7ED, icon #FFFFFF

**Mobile:**
- Dots indicator
- Position: Below cards, centered
- Style: Small circles, 8px diameter
- Active: #1CE7ED, Inactive: #E5E5E5

**Behavior:**
- Smooth scroll/slide
- Loop: Yes (infinite carousel)
- Autoplay: Optional, 4s interval, pause on hover

#### **D. CTA "Xem tất cả"**

**Text:**
```
[Xem tất cả sản phẩm →]
```

**Styling:**
- Position: Center, dưới carousel
- Background: Transparent
- Border: 2px solid #1CE7ED
- Text: #1CE7ED, Inter SemiBold, 16px
- Padding: 14px 32px
- Border radius: 8px
- Hover: Background #1CE7ED, text #FFFFFF
- Margin top: 40px

#### **E. Background & Spacing**

**Section background:**
- Color: #FFFFFF (White)

**Padding:**
- Top/Bottom: 100px (desktop), 60px (mobile)
- Container: Max-width 1200px, centered

---

## 6. Section 4: TRUY XUẤT NGUỒN GỐC

### 6.1. Mục tiêu
- Làm nổi bật USP chính: Truy xuất 100%
- Giáo dục về hệ thống QR
- Xây dựng lòng tin tuyệt đối
- Khuyến khích thử QR demo

### 6.2. Wireframe Layout

```
┌────────────────────────────────────────────────────┐
│                                                    │
│           [SECTION HEADING]                        │
│      Minh bạch 100% - Truy xuất nguồn gốc         │
│                                                    │
│  ┌──────────────────┐  ┌──────────────────┐       │
│  │                  │  │                  │       │
│  │  [DEMO PHONE]    │  │  [CONTENT]       │       │
│  │  Screen showing  │  │                  │       │
│  │  QR scan result  │  │  Mỗi sản phẩm có │       │
│  │                  │  │  mã QR dẫn đến   │       │
│  │  [Animated]      │  │  thông tin đầy đủ│       │
│  │                  │  │                  │       │
│  │                  │  │  ✓ Tàu & ngư dân │       │
│  │                  │  │  ✓ Vùng khai thác│       │
│  │                  │  │  ✓ Thời gian     │       │
│  │                  │  │  ✓ Hành trình    │       │
│  │                  │  │                  │       │
│  │                  │  │  [Thử ngay]      │       │
│  │                  │  │                  │       │
│  └──────────────────┘  └──────────────────┘       │
│                                                    │
└────────────────────────────────────────────────────┘
```

### 6.3. Nội dung chi tiết

#### **A. Section Heading**

**Text:**
```
Minh bạch 100% - Truy xuất nguồn gốc
```

**Subheading:**
```
Mỗi sản phẩm có câu chuyện. Quét QR để biết.
```

**Typography:**
- Heading: Montserrat SemiBold, 40px, #2B2B2B, center
- Subheading: Inter Regular, 18px, #666666, center
- Margin bottom: 60px

#### **B. Layout: 2 cột**

**Desktop:** 50/50 split
- Left: Phone mockup với demo
- Right: Content + benefits

**Mobile:** Stack vertical
- Phone demo trên
- Content dưới

#### **C. Phone Mockup (Bên trái)**

**Visual:**
- iPhone mockup (hoặc generic phone)
- Screen hiển thị trang truy xuất nguồn gốc
- Có thể dùng actual screenshot hoặc designed mockup

**Screen content visible:**
```
┌─────────────────┐
│ [Logo] Truy xuất│
│                 │
│ [Ảnh Tôm Hùm]   │
│                 │
│ TÔM HÙM CÔ TÔ   │
│ ID: COTo-L-001  │
│                 │
│ 📍 Vùng B5      │
│ 🚢 Tàu QN-123   │
│ 👨 Nguyễn Văn H.│
│ ⏰ 6:15 AM      │
│                 │
│ [Bản đồ nhỏ]    │
│                 │
│ [Timeline]      │
└─────────────────┘
```

**Styling:**
- Shadow: 0 20px 60px rgba(0,0,0,0.15) (depth)
- Slight tilt: rotate(-5deg) optional
- Animation: Subtle float (up/down 10px, infinite, 3s)

**Alternative: Video**
- Short clip (5s) của việc scan QR → xem kết quả
- Loop, autoplay, muted

#### **D. Content (Bên phải)**

**Headline:**
```
Biết nguồn gốc, yên tâm chọn
```
- Font: Montserrat Bold, 32px, #2B2B2B
- Margin bottom: 20px

**Description:**
```
Tại Ngày Mới - Cô Tô, mỗi sản phẩm đều có mã QR 
dẫn đến trang truy xuất chi tiết. Bạn sẽ biết chính 
xác hải sản mình mua đến từ đâu.
```
- Font: Inter Regular, 18px, #666666
- Line height: 1.6
- Margin bottom: 32px

**Benefits list:**

```
✓ Tàu đánh cá & Thuyền trưởng
  Biết ai đã đánh bắt hải sản của bạn

✓ Vùng khai thác (GPS)
  Xem bản đồ chính xác vùng biển

✓ Thời gian khai thác
  Từ giờ nào, ngày nào

✓ Hành trình làm lạnh
  Timeline đầy đủ từ biển đến bạn
```

**Styling mỗi item:**
- Icon: Checkmark trong circle, 32×32px, #1CE7ED
- Heading: Inter SemiBold, 16px, #2B2B2B
- Description: Inter Regular, 14px, #666666
- Spacing: 24px giữa các items

**Layout:**
- Vertical list
- Icon bên trái, content bên phải
- Grid gap: 24px

#### **E. CTA**

**Primary CTA:**
```
[Thử quét QR mẫu →]
```
- Background: #FADE3F (Golden Dawn)
- Text: #2B2B2B, Inter SemiBold, 16px
- Padding: 16px 32px
- Border radius: 8px
- Hover: Darken 10%, scale 1.05
- Margin top: 32px

**Action:** Link đến `/demo-trace` hoặc popup với QR demo

**Secondary info:**
```
Hoặc nhập ID: COTo-DEMO-001
```
- Font: Inter Regular, 14px, #999999
- Margin top: 12px

#### **F. Background & Visual Elements**

**Section background:**
- Color: #F4EBDD (Sand) - tạo contrast với sections khác

**Decorative elements (optional):**
- Subtle wave pattern ở góc
- QR code watermark (opacity 5%) ở background

**Padding:**
- Top/Bottom: 100px (desktop), 60px (mobile)

---

## 7. Section 5: GIỚI THIỆU CÔ TÔ

### 7.1. Mục tiêu
- Kể câu chuyện về Cô Tô (origin story)
- Giải thích tại sao biển Cô Tô đặc biệt
- Tạo kết nối cảm xúc với nơi chốn
- Xây dựng authenticity

### 7.2. Wireframe Layout

```
┌────────────────────────────────────────────────────┐
│                                                    │
│  [FULL-WIDTH BACKGROUND IMAGE: Cô Tô seascape]    │
│                                                    │
│  ┌─────────────────────────────────────────────┐  │
│  │                                             │  │
│  │  [SECTION HEADING - on image overlay]      │  │
│  │  Vùng biển lạnh, hải sản tươi ngon         │  │
│  │                                             │  │
│  └─────────────────────────────────────────────┘  │
│                                                    │
├────────────────────────────────────────────────────┤
│                                                    │
│  [CONTENT AREA - White background]                │
│                                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ [Icon]   │  │ [Icon]   │  │ [Icon]   │        │
│  │ 18-22°C  │  │ 10-15m   │  │ Coral    │        │
│  │ Nước lạnh│  │ Trong vắt│  │ San hô   │        │
│  │ nhất VN  │  │          │  │ phong phú│        │
│  └──────────┘  └──────────┘  └──────────┘        │
│                                                    │
│  [MAIN STORY CONTENT - 2 columns]                 │
│  ┌───────────────────┐  ┌───────────────────┐    │
│  │ [Text content]    │  │ [Images gallery]  │    │
│  │ Cô Tô nằm ở...   │  │ - Fisherman       │    │
│  │ Dòng hải lưu...  │  │ - Boat            │    │
│  │ Hải sản phát...  │  │ - Underwater      │    │
│  └───────────────────┘  └───────────────────┘    │
│                                                    │
└────────────────────────────────────────────────────┘
```

### 7.3. Nội dung chi tiết

#### **A. Hero Image Section**

**Image:**
- Ảnh Cô Tô đẹp: Biển xanh, trời xanh, có thể aerial view
- Resolution: 2560×1440
- Filter: Cool tone, slight desaturation
- Overlay: Gradient đen từ bottom (opacity 50%)

**Heading (overlay trên ảnh):**
```
Cô Tô - Vùng biển lạnh phía Bắc
```

**Subheading:**
```
Nơi hải lưu Bắc mang đến hương vị đặc biệt
```

**Typography:**
- Heading: Montserrat Bold, 48px, #FFFFFF
- Subheading: Inter Regular, 20px, #F4EBDD
- Position: Bottom 1/3 của image, centered hoặc left-aligned
- Text shadow: 0 2px 8px rgba(0,0,0,0.5)

**Height:** 60vh (desktop), 40vh (mobile)

#### **B. Stats/Facts Bar (Ngay dưới hero image)**

**3 stat cards, ngang:**

**Card 1:**
```
┌─────────────┐
│  [Icon 🌊]  │
│   18-22°C   │
│ Nước lạnh   │
│  nhất VN    │
└─────────────┘
```

**Card 2:**
```
┌─────────────┐
│  [Icon 👁️]  │
│   10-15m    │
│ Độ trong vắt│
│             │
└─────────────┘
```

**Card 3:**
```
┌─────────────┐
│  [Icon 🪸]  │
│  Rạn san hô │
│  phong phú  │
│             │
└─────────────┘
```

**Styling:**
- Background: #FFFFFF
- Border: 1px solid #E5E5E5 (optional)
- Padding: 32px
- Icon: 48×48px, color #1CE7ED
- Number/main text: Montserrat Bold, 32px, #2B2B2B
- Description: Inter Regular, 14px, #666666
- Layout: Flexbox, equal width, gap 24px
- Responsive: Stack trên mobile

#### **C. Main Story Content (2 cột)**

**Left Column: Text**

**Heading:**
```
Tại sao Cô Tô đặc biệt?
```
- Font: Montserrat SemiBold, 32px, #2B2B2B
- Margin bottom: 24px

**Body paragraphs:**

```
Cô Tô nằm ở cực Đông Bắc Việt Nam, là hòn đảo xa bờ 
nhất tỉnh Quảng Ninh. Đây là nơi dòng hải lưu lạnh 
từ phía Bắc đi qua, mang theo nhiệt độ nước 18-22°C 
— lạnh nhất cả nước.

Nước lạnh khiến hải sản phát triển chậm hơn, tích 
lũy nhiều dưỡng chất, tạo nên thịt chắc và vị ngọt 
thanh đặc trưng. Đó là lý do tại sao cá, tôm, mực 
từ Cô Tô có hương vị khác biệt.

Vùng biển Cô Tô còn có độ trong vắt cao (10-15m), 
nền đáy cát - san hô giàu khoáng chất, và dòng chảy 
mạnh giúp nước luôn tuần hoàn. Môi trường tự nhiên 
thuần khiết này là "bí mật" tạo nên hải sản cao cấp.
```

**Typography:**
- Font: Inter Regular, 18px, #666666
- Line height: 1.7
- Paragraph spacing: 24px
- Max-width: 600px (readability)

**Blockquote (optional):**
```
"Biển Cô Tô cho tôi những mẻ cá ngon nhất. 
20 năm đánh cá, tôi tự hào về vùng biển này."
— Nguyễn Văn Hùng, Thuyền trưởng tàu QN-123
```

**Styling:**
- Border-left: 4px solid #1CE7ED
- Padding left: 24px
- Font: Inter Italic, 18px, #2B2B2B
- Attribution: Inter Regular, 14px, #999999
- Margin: 32px 0

**Right Column: Images**

**Image gallery (2-3 ảnh):**

1. **Ngư dân trên tàu** (portrait)
2. **View biển Cô Tô** (landscape)
3. **Underwater - san hô** (square) - optional

**Layout:**
- Grid hoặc masonry style
- Gap: 16px
- Border radius: 8px
- Hover: Slight zoom

**Alternative: Single large image**
- Ngư dân cầm hải sản tươi, mỉm cười
- Full height match với text column

#### **D. Background & Spacing**

**Section background:**
- Hero: Image (như mô tả)
- Stats bar: #FFFFFF
- Main content: #FFFFFF hoặc #F4EBDD (Sand)

**Padding:**
- Stats bar: 40px vertical, container horizontal
- Main content: 100px vertical (desktop), 60px (mobile)

---

## 8. Section 6: BỀN VỮNG

### 8.1. Mục tiêu
- Truyền tải cam kết về sustainability
- Giải thích quy trình khai thác có trách nhiệm
- Appeal đến giá trị của khách hàng conscious
- Xây dựng long-term trust

### 8.2. Wireframe Layout

```
┌────────────────────────────────────────────────────┐
│                                                    │
│           [SECTION HEADING]                        │
│      Bền vững từ biển đến bàn ăn                  │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │                                              │ │
│  │  [PROCESS TIMELINE/INFOGRAPHIC]              │ │
│  │                                              │ │
│  │  Khai thác → Làm lạnh → Vận chuyển → Giao  │ │
│  │  <30 phút     -18°C      Cold chain    hàng│ │
│  │                                              │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  [COMMITMENTS - 3 columns]                        │
│                                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ KHÔNG    │  │ GIẢM     │  │ BẢO VỆ   │        │
│  │ đánh bắt │  │ bycatch  │  │ hệ sinh  │        │
│  │ mùa sinh │  │ <5%      │  │ thái     │        │
│  │ sản      │  │          │  │          │        │
│  └──────────┘  └──────────┘  └──────────┘        │
│                                                    │
│  [CERTIFICATION PATH]                             │
│  Hướng tới chứng nhận MSC/ASC trong 24 tháng     │
│                                                    │
└────────────────────────────────────────────────────┘
```

### 8.3. Nội dung chi tiết

#### **A. Section Heading**

**Text:**
```
Bền vững từ biển đến bàn ăn
```

**Subheading:**
```
Quy trình khai thác và bảo quản có trách nhiệm
```

**Typography:**
- Heading: Montserrat SemiBold, 40px, #2B2B2B, center
- Subheading: Inter Regular, 18px, #666666, center
- Margin bottom: 60px

#### **B. Process Timeline (Infographic)**

**Visual style:** Horizontal timeline với icons và arrows

```
🚢 KHAI THÁC           ❄️ LÀM LẠNH          🚚 VẬN CHUYỂN        📦 GIAO HÀNG
Vùng được phê duyệt    Trong 30 phút       Cold chain -18°C    Đến tay khách
↓                      ↓                   ↓                   ↓
Lưới chọn lọc          Ice slurry system   Không gián đoạn     Trong 24h
Nhật ký điện tử        Nhiệt độ tự động    Tem kiểm soát       Đóng gói sinh học
```

**Implementation:**

**Container:**
- Background: #F4EBDD (Sand) hoặc gradient (White → Sand)
- Padding: 40px
- Border radius: 16px
- Max-width: 1000px, centered

**Each step:**
- Icon: 64×64px, color #1CE7ED
- Title: Montserrat Bold, 20px, #2B2B2B
- Description 1: Inter SemiBold, 16px, #2B2B2B
- Description 2-3: Inter Regular, 14px, #666666
- Arrow between steps: → (color #1CE7ED, 32px)

**Layout:**
- Desktop: 4 steps horizontal, equal spacing
- Tablet: 2×2 grid
- Mobile: Vertical stack với line connecting

#### **C. Commitments (3 cột)***

**Card 1: KHÔNG đánh bắt mùa sinh sản**

```
┌──────────────────────┐
│   [Icon Calendar X]  │
│                      │
│   KHÔNG ĐÁNH BẮT     │
│   Mùa sinh sản       │
│                      │
│ Chúng tôi tuân thủ   │
│ nghiêm ngặt lịch cấm │
│ đánh bắt để bảo vệ   │
│ nguồn lợi hải sản    │
│ cho thế hệ sau.      │
│                      │
└──────────────────────┘
```

**Card 2: GIẢM bycatch**

```
┌──────────────────────┐
│   [Icon Target]      │
│                      │
│   GIẢM BYCATCH       │
│   Mục tiêu <5%       │
│                      │
│ Sử dụng lưới chọn lọc│
│ và thả ngay cá non,  │
│ loài cấm. Hiện tại   │
│ bycatch chỉ 3.2%.    │
│                      │
└──────────────────────┘
```

**Card 3: BẢO VỆ hệ sinh thái**

```
┌──────────────────────┐
│   [Icon Coral]       │
│                      │
│   BẢO VỆ HỆ SINH THÁI│
│                      │
│ Không sử dụng phương │
│ thức đánh bắt phá hủy│
│ đáy biển. Tham gia   │
│ phục hồi san hô.     │
│                      │
└──────────────────────┘
```

**Styling:**
- Background: #FFFFFF
- Border: 2px solid #1CE7ED (để highlight commitment)
- Border radius: 12px
- Padding: 32px
- Icon: 56×56px, color #1CE7ED
- Heading: Montserrat Bold, 20px, #2B2B2B, uppercase
- Subheading: Inter SemiBold, 16px, #1CE7ED
- Body: Inter Regular, 15px, #666666, line-height 1.6
- Layout: Equal width, gap 24px
- Hover: Subtle lift shadow

#### **D. Certification Path**

**Heading:**
```
Hướng tới chứng nhận quốc tế
```

**Content:**
```
Chúng tôi đang trên hành trình đạt chứng nhận:

[Logo MSC]  Marine Stewardship Council
           Cho khai thác tự nhiên bền vững

[Logo ASC]  Aquaculture Stewardship Council
           Cho nuôi trồng thủy sản có trách nhiệm

Timeline: Hoàn thành pre-assessment trong 12 tháng
         Full certification trong 24-36 tháng
```

**Styling:**
- Background: Light gradient (#F4EBDD → White)
- Padding: 40px
- Border-left: 4px solid #1CE7ED
- Logos: Grayscale, 120px width
- Text: Inter Regular, 16px, #666666
- Layout: Horizontal logos, vertical text

#### **E. Optional: Data Transparency**

**Callout box:**
```
📊 Minh bạch dữ liệu

Chúng tôi công bố hàng tháng:
• Tổng sản lượng khai thác
• Tỷ lệ bycatch (%)
• Lượng nhiên liệu/kg hải sản
• Rác thải thu hồi từ biển

[→ Xem báo cáo tháng này]
```

**Styling:**
- Background: #FFFFFF
- Border: 1px dashed #1CE7ED
- Padding: 24px
- Width: Max 500px
- Position: Right side hoặc bottom của section

#### **F. Background & Spacing**

**Section background:**
- Color: #FFFFFF với subtle wave pattern (opacity 3%)

**Padding:**
- Top/Bottom: 100px (desktop), 60px (mobile)

---

## 9. Section 7: CSR & TÁC ĐỘNG

### 9.1. Mục tiêu
- Showcase tác động xã hội cụ thể
- Số liệu thực tế (không chỉ lời nói)
- Khiến khách hàng cảm thấy tốt khi mua
- Strengthen brand values

### 9.2. Wireframe Layout

```
┌────────────────────────────────────────────────────┐
│                                                    │
│  [BACKGROUND: Ảnh ngư dân/cộng đồng, có overlay]   │
│                                                    │
│           [SECTION HEADING]                        │
│        Mua là giúp - Biển xanh, ngư dân vui       │
│                                                    │
│  ┌─────────────────────────────────────────────┐  │
│  │                                             │  │
│  │  [IMPACT COUNTERS - Animated numbers]      │  │
│  │                                             │  │
│  │   523           5,200m²        50           │  │
│  │  Ngư dân      San hô phục hồi  Người đào tạo│  │
│  │  hợp tác                                    │  │
│  │                                             │  │
│  └─────────────────────────────────────────────┘  │
│                                                    │
│  [PROGRAMS - 2 columns]                           │
│                                                    │
│  ┌───────────────────┐  ┌───────────────────┐    │
│  │ QUỸ BIỂN SẠCH     │  │ CHƯƠNG TRÌNH      │    │
│  │ 1% doanh thu      │  │ BẾN MỚI           │    │
│  │ Phục hồi san hô   │  │ Đào tạo nghề biển │    │
│  │ Thu hồi rác       │  │ Hỗ trợ tài chính  │    │
│  └───────────────────┘  └───────────────────┘    │
│                                                    │
│  [CTA: Xem báo cáo tác động]                      │
│                                                    │
└────────────────────────────────────────────────────┘
```

### 9.3. Nội dung chi tiết

#### **A. Hero/Background Image**

**Image:**
- Ngư dân đang làm việc, cộng đồng, hoặc cảnh làm sạch biển
- Resolution: 2560×1440
- Overlay: Dark gradient (opacity 60%) để text rõ

**Height:** 80vh (desktop), 60vh (mobile)

#### **B. Section Heading (Overlay trên ảnh)**

**Text:**
```
Mua là giúp
Biển xanh, ngư dân vui
```

**Subheading:**
```
1% mỗi đơn hàng đóng góp vào Quỹ Biển Sạch Cô Tô
```

**Typography:**
- Heading: Montserrat Bold, 48px, #FFFFFF
- Subheading: Inter Regular, 20px, #FADE3F (Golden Dawn - để nổi bật)
- Align: Center
- Text shadow: 0 2px 12px rgba(0,0,0,0.6)

#### **C. Impact Counters (Số liệu animated)**

**3 counters ngang:**

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│              │  │              │  │              │
│     523      │  │   5,200m²    │  │      50      │
│              │  │              │  │              │
│  Ngư dân     │  │  Rạn san hô  │  │  Người trẻ   │
│  hợp tác     │  │  phục hồi    │  │  được đào tạo│
│              │  │              │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
```

**Styling:**
- Background: rgba(255, 255, 255, 0.95) (semi-transparent white)
- Padding: 40px
- Border radius: 16px
- Number: Montserrat Bold, 64px, #1CE7ED
- Description: Inter SemiBold, 16px, #2B2B2B
- Layout: Flexbox, equal width, gap 32px
- Shadow: 0 8px 32px rgba(0,0,0,0.1)

**Animation:**
- Count-up effect khi scroll vào view
- Duration: 2s
- Easing: ease-out

**Responsive:**
- Mobile: Stack vertical, full width

#### **D. Programs (2 cột)**

**Layout:**
- Desktop: 50/50 split
- Mobile: Stack vertical

##### **Card 1: Quỹ Biển Sạch Cô Tô**

```
┌─────────────────────────────────────┐
│  [Icon: Heart + Wave]               │
│                                     │
│  QUỸ BIỂN SẠCH CÔ TÔ               │
│  1% doanh thu cho đại dương        │
│                                     │
│  Chúng tôi cam kết trích 1% doanh  │
│  thu (không phải lợi nhuận) để:    │
│                                     │
│  ✓ Phục hồi rạn san hô             │
│  ✓ Thu hồi rác thải nhựa từ biển   │
│  ✓ Giáo dục bảo vệ môi trường      │
│                                     │
│  Đã đóng góp: 500 triệu VNĐ        │
│  (Năm đầu tiên)                    │
│                                     │
│  [→ Xem báo cáo chi tiết]          │
│                                     │
└─────────────────────────────────────┘
```

##### **Card 2: Chương trình Bến Mới**

```
┌─────────────────────────────────────┐
│  [Icon: People/Boat]                │
│                                     │
│  CHƯƠNG TRÌNH BẾN MỚI              │
│  Đào tạo & Hỗ trợ ngư dân          │
│                                     │
│  Tạo cơ hội cho cộng đồng ngư dân: │
│                                     │
│  ✓ Đào tạo kỹ năng đánh bắt an toàn│
│  ✓ Cho vay 0% lãi suất thiết bị    │
│  ✓ Bảo hiểm y tế & xã hội          │
│  ✓ Ưu tiên người trẻ & tái hòa nhập│
│                                     │
│  50 người đã được hỗ trợ           │
│  (6 tháng đầu)                     │
│                                     │
│  [→ Câu chuyện ngư dân]            │
│                                     │
└─────────────────────────────────────┘
```

**Styling:**
- Background: #FFFFFF
- Border: 1px solid #E5E5E5
- Border radius: 12px
- Padding: 40px
- Icon: 64×64px, color #1CE7ED
- Heading: Montserrat Bold, 24px, #2B2B2B
- Subheading: Inter Medium, 16px, #1CE7ED
- Body text: Inter Regular, 16px, #666666
- Checkmarks: #1CE7ED, 20×20px
- Stats highlight: Montserrat Bold, 20px, #2B2B2B
- Link: Inter Medium, 14px, #1CE7ED, underline on hover

#### **E. Transparency Link**

**Text:**
```
💙 Xem báo cáo tác động hàng tháng
```

**Styling:**
- Center aligned
- Font: Inter SemiBold, 18px
- Color: #1CE7ED
- Icon: Heart (💙) hoặc custom
- Underline on hover
- Margin top: 40px

**Link to:** `/impact-report` hoặc popup với detailed report

#### **F. Optional: Quote từ ngư dân**

```
"Nhờ Ngày Mới, gia đình tôi có thu nhập ổn định 
và con tôi được học nghề đánh bắt đúng cách."

— Nguyễn Văn Hùng, Ngư dân Cô Tô
```

**Styling:**
- Background: rgba(28, 231, 237, 0.1)
- Border-left: 4px solid #1CE7ED
- Padding: 24px
- Max-width: 700px, centered
- Font: Inter Italic, 18px, #2B2B2B
- Attribution: Inter Regular, 14px, #666666

#### **G. Background & Spacing**

**Section background:**
- Upper part: Image với overlay (như mô tả)
- Lower part (programs): #F4EBDD (Sand)

**Padding:**
- Upper (counters): 60px vertical
- Lower (programs): 80px vertical (desktop), 60px (mobile)

---

## 10. Section 8: ĐÁNH GIÁ KHÁCH HÀNG

### 10.1. Mục tiêu
- Social proof để xây dựng trust
- Showcase real customer experiences
- Tăng credibility
- Giảm mối lo ngại mua hàng

### 10.2. Wireframe Layout

```
┌────────────────────────────────────────────────────┐
│                                                    │
│           [SECTION HEADING]                        │
│       Khách hàng nói gì về Ngày Mới?              │
│                                                    │
│       ⭐⭐⭐⭐⭐ 4.9/5.0 (từ 500+ đánh giá)          │
│                                                    │
│  [TESTIMONIALS CAROUSEL]                           │
│                                                    │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐     │
│  │ [Avatar]  │  │ [Avatar]  │  │ [Avatar]  │     │
│  │           │  │           │  │           │     │
│  │ "Cá tuyết │  │ "Minh bạch│  │ "Chất     │     │
│  │ ngon tuyệt│  │ nguồn gốc │  │ lượng     │     │
│  │ vời..."   │  │ quá..."   │  │ tuyệt..."  │     │
│  │           │  │           │  │           │     │
│  │ - Lan N.  │  │ - Minh T. │  │ - Hà P.   │     │
│  │ ⭐⭐⭐⭐⭐   │  │ ⭐⭐⭐⭐⭐   │  │ ⭐⭐⭐⭐⭐   │     │
│  └───────────┘  └───────────┘  └───────────┘     │
│                                                    │
│  [← Previous]  [Dots indicator]  [Next →]         │
│                                                    │
│  [LOGOS: Được tin dùng bởi]                       │
│  [Logo Nhà hàng A] [Logo B] [Logo C]              │
│                                                    │
└────────────────────────────────────────────────────┘
```

### 10.3. Nội dung chi tiết

#### **A. Section Heading**

**Text:**
```
Khách hàng nói gì về Ngày Mới?
```

**Rating summary:**
```
⭐⭐⭐⭐⭐ 4.9/5.0
Từ 500+ đánh giá
```

**Typography:**
- Heading: Montserrat SemiBold, 40px, #2B2B2B, center
- Stars: 32px, #FADE3F (Golden Dawn)
- Rating: Montserrat Bold, 24px, #2B2B2B
- Review count: Inter Regular, 16px, #666666
- Margin bottom: 60px

#### **B. Testimonial Cards**

**Hiển thị:**
- Desktop: 3 cards visible
- Tablet: 2 cards
- Mobile: 1 card, swipeable

**Card structure:**

```
┌──────────────────────────────┐
│  [Avatar photo, 80×80px]     │
│                              │
│  ⭐⭐⭐⭐⭐                     │
│                              │
│  "Cá tuyết Cô Tô ngon tuyệt  │
│  vời! Thịt chắc, ngọt thanh, │
│  không tanh. Đặc biệt là mã  │
│  QR truy xuất rất chi tiết,  │
│  làm tôi yên tâm cho con ăn."│
│                              │
│  — Lan Nguyễn                │
│  Mẹ 2 con, Hà Nội            │
│                              │
│  [Verified Purchase ✓]       │
└──────────────────────────────┘
```

**Styling:**

**Card:**
- Background: #FFFFFF
- Border: 1px solid #E5E5E5
- Border radius: 12px
- Padding: 32px
- Shadow: 0 4px 12px rgba(0,0,0,0.05)
- Hover: Lift effect (shadow increase, translateY(-4px))

**Avatar:**
- Size: 80×80px (desktop), 64×64px (mobile)
- Border-radius: 50% (circle)
- Border: 3px solid #1CE7ED
- Position: Top center hoặc top left

**Stars:**
- Size: 20px
- Color: #FADE3F
- Margin: 16px 0

**Quote:**
- Font: Inter Regular, 16px (desktop), 15px (mobile)
- Color: #666666
- Line height: 1.6
- Style: Có thể thêm quote marks " " lớn ở đầu (decorative)
- Max lines: None (let it expand naturally)

**Attribution:**
- Name: Inter SemiBold, 16px, #2B2B2B
- Role/Location: Inter Regular, 14px, #999999
- Margin top: 20px

**Verified badge:**
- Text: "Đã mua hàng ✓" hoặc "Verified Purchase"
- Font: Inter Regular, 12px
- Color: #1CE7ED
- Background: rgba(28, 231, 237, 0.1)
- Padding: 4px 8px
- Border radius: 4px

#### **C. Sample Testimonials (6-8 testimonials, rotate)**

**Testimonial 1:**
```
⭐⭐⭐⭐⭐
"Cá tuyết Cô Tô ngon tuyệt vời! Thịt chắc, ngọt thanh, 
không tanh. Đặc biệt là mã QR truy xuất rất chi tiết, 
làm tôi yên tâm cho con ăn dặm."

— Lan Nguyễn
Mẹ 2 con, Hà Nội
[Đã mua hàng ✓]
```

**Testimonial 2:**
```
⭐⭐⭐⭐⭐
"Lần đầu mua hải sản mà biết rõ nguồn gốc đến thế. 
Quét QR thấy cả tên thuyền trưởng, giờ đánh bắt. 
Chất lượng thì không chê vào đâu được!"

— Minh Trần
Nhân viên công nghệ, TP.HCM
[Đã mua hàng ✓]
```

**Testimonial 3:**
```
⭐⭐⭐⭐⭐
"Nhà hàng tôi dùng hải sản Ngày Mới được 6 tháng. 
Chất lượng ổn định, nguồn cung đủ, và khách rất thích 
câu chuyện truy xuất nguồn gốc trên menu."

— Chef Hùng
Executive Chef, Fine Dining HN
[Đối tác B2B ✓]
```

**Testimonial 4:**
```
⭐⭐⭐⭐⭐
"Tôi thích ý tưởng 1% cho Quỹ Biển Sạch. Vừa ăn ngon, 
vừa góp phần bảo vệ môi trường. Đóng gói cũng sinh thái, 
không nhiều plastic!"

— Hà Phạm
Kiến trúc sư, Hà Nội
[Đã mua hàng ✓]
```

**Testimonial 5:**
```
⭐⭐⭐⭐⭐
"Giao hàng nhanh, đóng gói cẩn thận. Còn lạnh ngắt khi 
nhận. Tem nhiệt độ vẫn xanh, chứng tỏ cold chain đúng chuẩn. 
Impressed!"

— Tuấn Lê
Software Engineer, TP.HCM
[Đã mua hàng ✓]
```

**Testimonial 6:**
```
⭐⭐⭐⭐⭐
"Ban đầu thấy giá hơi cao, nhưng ăn rồi mới hiểu tại sao. 
Hải sản Cô Tô thật sự khác. Ngọt tự nhiên, không cần nêm 
nhiều. Đáng từng đồng!"

— My Vũ
Blogger ẩm thực
[Đã mua hàng ✓]
```

#### **D. Carousel Controls**

**Desktop:**
- Arrow buttons: Left & Right
- Style: Circle, 48×48px, #FFFFFF background, shadow
- Icon: Chevron, #2B2B2B
- Position: Absolute, vertically centered, outside cards
- Hover: Background #1CE7ED, icon #FFFFFF

**Mobile:**
- Swipe gesture (touch)
- Dots indicator below
- Dots: 8px circle, active #1CE7ED, inactive #E5E5E5

**Autoplay:**
- Interval: 5 seconds
- Pause on hover/touch

#### **E. Trust Logos (Được tin dùng bởi)**

**Heading:**
```
Được tin dùng bởi
```
- Font: Inter Regular, 14px, #999999, uppercase, center
- Margin: 60px 0 24px 0

**Logos:**
- 4-6 logos của nhà hàng/đối tác nổi tiếng (nếu có)
- Grayscale (desaturate), opacity 60%
- Hover: Full color, opacity 100%
- Size: Max height 60px, auto width
- Layout: Horizontal, equal spacing, centered
- Responsive: 2 rows trên mobile

**Ví dụ:**
```
[Logo The Gourmet Corner] [Logo Maison Vie] [Logo Anan Saigon]
[Logo L'Usine] [Logo Pizza 4P's] [Logo Cục Thủy sản VN]
```

#### **F. Background & Spacing**

**Section background:**
- Color: #F4EBDD (Sand) - tạo warmth

**Padding:**
- Top/Bottom: 100px (desktop), 60px (mobile)

---

## 11. Section 9: CTA CUỐI

### 11.1. Mục tiêu
- **Conversion cuối cùng** - last push
- Tổng hợp value prop
- Clear, compelling call to action
- Sense of urgency (optional)

### 11.2. Wireframe Layout

```
┌────────────────────────────────────────────────────┐
│                                                    │
│  [BACKGROUND: Gradient hoặc ảnh subtle]            │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │                                              │ │
│  │         Sẵn sàng thưởng thức                 │ │
│  │      hương vị biển Bắc chưa?                 │ │
│  │                                              │ │
│  │  Hải sản tươi Cô Tô • Giao trong 24h         │ │
│  │  • Truy xuất 100% • 1% cho Biển Xanh        │ │
│  │                                              │ │
│  │  [CTA Primary: Xem sản phẩm ngay]            │ │
│  │  [CTA Secondary: Liên hệ tư vấn]             │ │
│  │                                              │ │
│  │  Hoặc gọi: 1900 xxxx (8:00 - 20:00)         │ │
│  │                                              │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
└────────────────────────────────────────────────────┘
```

### 11.3. Nội dung chi tiết

#### **A. Background**

**Option 1: Gradient**
- Colors: #1CE7ED (Crystal Sea) → #FADE3F (Golden Dawn)
- Direction: Diagonal (135deg) hoặc horizontal
- Opacity: Full color

**Option 2: Image**
- Ảnh: Bàn ăn với món hải sản đẹp, gia đình vui vẻ
- Overlay: Gradient dark (opacity 70%) để text rõ

**Option 3: Pattern**
- Background color: #1CE7ED
- Subtle wave pattern: White, opacity 10%

**Height:** 50vh (desktop), 60vh (mobile)

#### **B. Content**

**Headline:**
```
Sẵn sàng thưởng thức hương vị biển Bắc chưa?
```

**Alternative headlines:**
```
"Hải sản Cô Tô - Tươi ngon đang chờ bạn"
"Đặt hàng hôm nay, giao trong 24h"
"Ngày mới, bữa cơm ngon hơn"
```

**Typography:**
- Font: Montserrat Bold
- Size: 48px (desktop), 32px (mobile)
- Color: #FFFFFF
- Align: Center
- Text shadow: 0 2px 8px rgba(0,0,0,0.3)
- Margin bottom: 16px

**Subheading/Value props:**
```
Hải sản tươi Cô Tô • Giao trong 24h • Truy xuất 100% • 1% cho Biển Xanh
```

**Typography:**
- Font: Inter Medium
- Size: 18px (desktop), 16px (mobile)
- Color: #F4EBDD (softer than pure white)
- Separator: • (bullet) với slight spacing
- Margin bottom: 32px

#### **C. CTA Buttons**

**Primary CTA:**
```
[Xem sản phẩm ngay →]
```

**Styling:**
- Background: #FADE3F (Golden Dawn)
- Text: #2B2B2B, Montserrat Bold, 18px
- Padding: 18px 48px (lớn hơn CTAs thường để nổi bật)
- Border radius: 8px
- Shadow: 0 8px 24px rgba(250, 222, 63, 0.5)
- Hover: 
  - Scale: 1.08 (lớn hơn)
  - Shadow: 0 12px 32px rgba(250, 222, 63, 0.6)
  - Brightness: 110%
- Animation: Pulse effect subtle (optional)

**Secondary CTA:**
```
[Liên hệ tư vấn]
```

**Styling:**
- Background: Transparent
- Border: 2px solid #FFFFFF
- Text: #FFFFFF, Inter SemiBold, 16px
- Padding: 16px 40px
- Border radius: 8px
- Hover: 
  - Background: rgba(255,255,255,0.15)
  - Scale: 1.05

**Layout:**
- Desktop: Ngang, cách nhau 16px, center
- Mobile: Stack vertical, full width, cách nhau 12px

#### **D. Contact Info**

**Text:**
```
Hoặc gọi: 1900 xxxx (8:00 - 20:00 hàng ngày)
```

**Alternative:**
```
Zalo/Hotline: 0123 456 789
Email: hello@ngaymoi-coto.vn
```

**Typography:**
- Font: Inter Regular
- Size: 16px
- Color: #FFFFFF, opacity 90%
- Align: Center
- Margin top: 24px

**Icons:**
- Phone icon: 20×20px, color #FFFFFF
- Optional: Click to call link trên mobile

#### **E. Optional: Urgency Element**

**Nếu có promotion:**
```
🎉 Ưu đãi đặc biệt: Giảm 15% đơn đầu tiên
Nhập mã: FIRST15
```

**Styling:**
- Background: rgba(237, 28, 168, 0.9) (Vivid Coral)
- Padding: 12px 24px
- Border radius: 24px (pill shape)
- Font: Inter Bold, 14px, #FFFFFF
- Position: Above headline hoặc below CTAs
- Animation: Gentle shake hoặc glow

#### **F. Trust Signals (Optional)**

**Icons/badges nhỏ dưới CTAs:**
```
✓ Miễn phí ship >500k    ✓ Đổi trả trong 24h    ✓ Thanh toán an toàn
```

**Styling:**
- Font: Inter Regular, 12px
- Color: #FFFFFF, opacity 80%
- Icons: 16×16px, color #FFFFFF
- Layout: Horizontal, gap 24px
- Center aligned

#### **G. Spacing**

**Padding:**
- Top/Bottom: 80px (desktop), 60px (mobile)
- Left/Right: Container standard

**Content max-width:** 800px, centered

---

## 12. Section 10: FOOTER

### 12.1. Mục tiêu
- Cung cấp thông tin công ty
- Links navigation
- Legal/policy pages
- Contact & social media
- Newsletter signup

### 12.2. Wireframe Layout

```
┌────────────────────────────────────────────────────┐
│  [FOOTER - 4 columns trên desktop]                 │
│                                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────┐ │
│  │ VỀ       │ │ SẢN PHẨM │ │ HỖ TRỢ   │ │ KẾT  │ │
│  │ CHÚNG TÔI│ │          │ │          │ │ NỐI  │ │
│  │          │ │ Premium  │ │ Liên hệ  │ │      │ │
│  │ [Logo]   │ │ Select   │ │ FAQs     │ │ FB   │ │
│  │          │ │ Fresh    │ │ Giao hàng│ │ IG   │ │
│  │ Tagline  │ │ Khuyến mãi│ │ Đổi trả  │ │ YT   │ │
│  │          │ │          │ │ Chính    │ │ Zalo │ │
│  │          │ │          │ │ sách     │ │      │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────┘ │
│                                                    │
│  [NEWSLETTER SIGNUP]                               │
│  Đăng ký nhận tin • Ưu đãi & công thức mới         │
│  [Email input] [Đăng ký]                           │
│                                                    │
├────────────────────────────────────────────────────┤
│  [BOTTOM BAR]                                      │
│  © 2025 Ngày Mới - Cô Tô | Chính sách bảo mật |   │
│  Điều khoản sử dụng                                │
└────────────────────────────────────────────────────┘
```

### 12.3. Nội dung chi tiết

#### **A. Footer Columns**

##### **Column 1: Về chúng tôi**

```
[Logo Ngày Mới - Cô Tô]

Hương vị biển Bắc. 
Từ Cô Tô đến bàn ăn.

Hải sản cao cấp với truy xuất 
minh bạch 100%.

GPKD: 0123456789
Cấp ngày: 01/01/2024
```

**Styling:**
- Logo: 120px width, full color
- Tagline: Inter Regular, 14px, #666666
- Description: Inter Regular, 14px, #666666, line-height 1.6
- Business info: Inter Regular, 12px, #999999

##### **Column 2: Sản phẩm**

```
SẢN PHẨM

• Premium
• Select
• Fresh
• Khuyến mãi
• Sản phẩm mới
```

**Styling:**
- Header: Montserrat Bold, 14px, #2B2B2B, uppercase
- Links: Inter Regular, 14px, #666666
- Hover: Color #1CE7ED, underline
- Line height: 2 (spacing)

##### **Column 3: Hỗ trợ**

```
HỖ TRỢ KHÁCH HÀNG

• Liên hệ
• Câu hỏi thường gặp
• Hướng dẫn đặt hàng
• Chính sách giao hàng
• Chính sách đổi trả
• Truy xuất nguồn gốc
• Tác động xã hội
```

##### **Column 4: Kết nối**

```
KẾT NỐI

[FB icon] Facebook
[IG icon] Instagram
[YT icon] YouTube
[Zalo icon] Zalo

LIÊN HỆ

📞 1900 xxxx
📧 hello@ngaymoi-coto.vn
📍 Hà Nội, Việt Nam

Giờ làm việc:
8:00 - 20:00 (Hàng ngày)
```

**Icon styling:**
- Size: 24×24px
- Color: #666666
- Hover: #1CE7ED, scale 1.1
- Layout: Vertical list, gap 12px

#### **B. Newsletter Signup**

**Section riêng, full width trong footer:**

```
┌────────────────────────────────────────────────────┐
│  NHẬN TIN TỪ NGÀY MỚI - CÔ TÔ                      │
│  Ưu đãi đặc biệt • Công thức mới • Câu chuyện biển │
│                                                    │
│  [Email của bạn...]  [Đăng ký →]                  │
│                                                    │
│  ✓ Giảm 10% cho đơn đầu tiên khi đăng ký          │
└────────────────────────────────────────────────────┘
```

**Styling:**

**Container:**
- Background: #F4EBDD (Sand) hoặc gradient subtle
- Padding: 40px
- Border-top: 1px solid #E5E5E5
- Margin: 40px 0

**Heading:**
- Font: Montserrat SemiBold, 20px, #2B2B2B

**Subheading:**
- Font: Inter Regular, 14px, #666666

**Input:**
- Width: 300px (desktop), full width (mobile)
- Height: 48px
- Padding: 0 16px
- Border: 1px solid #E5E5E5
- Border radius: 8px (left side if grouped với button)
- Font: Inter Regular, 14px
- Placeholder: "Email của bạn..."

**Button:**
- Height: 48px (match input)
- Padding: 0 24px
- Background: #1CE7ED
- Text: #FFFFFF, Inter SemiBold, 14px
- Border radius: 8px (right side if grouped)
- Hover: Darken 10%

**Layout:** 
- Desktop: Input + Button ngang (grouped)
- Mobile: Stack vertical

**Trust badge:**
- Icon checkmark
- Text: Inter Regular, 12px, #666666

#### **C. Bottom Bar**

**Background:** #2B2B2B (Charcoal)

**Content:**
```
© 2025 Ngày Mới - Cô Tô. All rights reserved.
Chính sách bảo mật | Điều khoản sử dụng | Cookies
```

**Styling:**
- Padding: 24px 0
- Text: Inter Regular, 13px, #999999
- Links: Hover #FFFFFF, underline
- Align: Center (mobile), space-between (desktop)
- Separators: | with spacing

**Optional additions:**
```
Made with 💙 in Việt Nam
```

#### **D. Background & Overall Styling**

**Footer main background:** #FFFFFF

**Padding:**
- Overall: 60px vertical, container horizontal
- Between columns: 40px gap
- Newsletter section: 40px vertical separate

**Responsive:**
- Desktop: 4 columns equal width
- Tablet: 2×2 grid
- Mobile: Stack vertical, full width

**Typography defaults:**
- Headers: Montserrat Bold, 14px, #2B2B2B, uppercase, margin-bottom 16px
- Links: Inter Regular, 14px, #666666, line-height 2
- Body text: Inter Regular, 14px, #666666, line-height 1.6

---

## 13. Thông số kỹ thuật

### 13.1. Performance Requirements

**Page Load:**
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.5s
- Total page size: < 3MB

**Images:**
- Format: WebP (primary), JPG (fallback)
- Lazy loading: Yes (except above fold)
- Srcset: Multiple sizes for responsive
- Compression: 80-85% quality

**Video:**
- Format: MP4 (H.264)
- Max size: 3MB
- Autoplay: Muted only
- Fallback: Poster image

**Code:**
- Minify: CSS, JS
- Critical CSS: Inline for above-fold
- Defer: Non-critical JS
- CDN: For assets

### 13.2. Browser Support

**Desktop:**
- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

**Mobile:**
- iOS Safari (last 2 versions)
- Chrome Mobile (last 2 versions)
- Samsung Internet (last version)

**Graceful degradation:** Older browsers get functional version without advanced effects

### 13.3. Accessibility (WCAG 2.1 Level AA)

**Color contrast:**
- Text: Minimum 4.5:1
- Large text (>18px): Minimum 3:1
- UI components: Minimum 3:1

**Keyboard navigation:**
- All interactive elements focusable
- Logical tab order
- Focus indicators visible

**Screen readers:**
- Semantic HTML (proper heading hierarchy)
- Alt text for all images
- ARIA labels where needed
- Skip to content link

**Forms:**
- Labels associated với inputs
- Error messages clear
- Required fields indicated

### 13.4. Typography Scale

**Desktop:**
```
H1: 48-56px (3-3.5rem)
H2: 36-40px (2.25-2.5rem)
H3: 28-32px (1.75-2rem)
H4: 24px (1.5rem)
Body Large: 18px (1.125rem)
Body: 16px (1rem)
Small: 14px (0.875rem)
Tiny: 12px (0.75rem)
```

**Mobile (scale down ~36%):**
```
H1: 32-36px
H2: 24-28px
H3: 20-22px
H4: 18px
Body: 16px
Small: 14px
Tiny: 12px
```

### 13.5. Spacing System

**Base unit:** 4px

**Scale:**
```
xs:   4px
sm:   8px
base: 16px
md:   24px
lg:   32px
xl:   48px
2xl:  64px
3xl:  96px
4xl:  128px
```

---

## 14. Tối ưu Mobile

### 14.1. Mobile-First Approach

**Breakpoints:**
```
Mobile:  < 768px
Tablet:  768px - 1023px
Desktop: ≥ 1024px
Large:   ≥ 1440px
```

### 14.2. Mobile-Specific Optimizations

#### **Hero Section:**
- Height: 100vh (full screen impact)
- Video off, use static image
- Font sizes: 64% of desktop
- CTAs: Full width, stack vertical
- Padding: 24px sides

#### **Navigation:**
- Hamburger menu (không show full nav)
- Sticky header: 60px height
- Logo: Smaller size (100px width)
- Menu overlay: Full screen với close button

#### **Product Cards:**
- 1 card per row (hoặc 1.2 để hint scroll)
- Swipe gesture
- Touch-friendly: 44×44px minimum tap target
- Spacing: 16px between cards

#### **Forms & Inputs:**
- Full width inputs
- Large touch targets (48px height)
- Input font size ≥ 16px (avoid iOS zoom)
- Clear button visible

#### **Images:**
- Smaller resolution (max 800px width)
- Aggressive lazy loading
- Low-quality placeholders (LQIP)

#### **Animations:**
- Reduce motion nếu user prefers
- Simpler animations (avoid heavy)
- Shorter durations (0.3s vs 0.6s)

### 14.3. Touch Interactions

**Swipe:**
- Product carousel
- Testimonials
- Image galleries

**Tap:**
- Minimum 44×44px target
- Visual feedback (ripple effect)
- Avoid hover-only interactions

**Pull-to-refresh:** Optional cho product listings

---

## 15. Performance & SEO

### 15.1. SEO Optimization

#### **Meta Tags:**

```html
<title>Hải Sản Cao Cấp Cô Tô - Minh Bạch 100% | Ngày Mới - Cô Tô</title>

<meta name="description" content="Hải sản tươi từ biển lạnh Cô Tô. Truy xuất nguồn gốc 100%. Giao trong 24h. 1% doanh thu cho Quỹ Biển Sạch. Đặt hàng ngay!">

<meta name="keywords" content="hải sản Cô Tô, cá tươi, tôm hùm, hải sản cao cấp, truy xuất nguồn gốc, hải sản bền vững">

<!-- Open Graph -->
<meta property="og:title" content="Ngày Mới - Cô Tô | Hải Sản Cao Cấp Minh Bạch">
<meta property="og:description" content="Hương vị biển Bắc. Tươi từ Cô Tô đến bàn ăn. Truy xuất 100%.">
<meta property="og:image" content="https://ngaymoi-coto.vn/og-image.jpg">
<meta property="og:url" content="https://ngaymoi-coto.vn">
<meta property="og:type" content="website">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Ngày Mới - Cô Tô | Hải Sản Cao Cấp">
<meta name="twitter:description" content="Hải sản tươi Cô Tô • Truy xuất 100% • Giao 24h">
<meta name="twitter:image" content="https://ngaymoi-coto.vn/twitter-card.jpg">
```

#### **Structured Data (Schema.org):**

```json
{
  "@context": "https://schema.org",
  "@type": "FoodEstablishment",
  "name": "Ngày Mới - Cô Tô",
  "description": "Hải sản cao cấp từ Cô Tô với truy xuất nguồn gốc 100%",
  "url": "https://ngaymoi-coto.vn",
  "logo": "https://ngaymoi-coto.vn/logo.png",
  "image": "https://ngaymoi-coto.vn/hero-image.jpg",
  "priceRange": "$$$$",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "VN",
    "addressLocality": "Hà Nội"
  },
  "telephone": "+84-1900-xxxx",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "500"
  }
}
```

#### **Heading Hierarchy:**
```
H1: Hương vị biển Bắc (Hero - 1 lần duy nhất)
H2: Các section headings (Tại sao chọn..., Sản phẩm..., etc)
H3: Sub-sections (Product names, benefit titles)
H4: Minor headings (card titles, etc)
```

### 15.2. Performance Optimizations

**Critical CSS:**
- Inline CSS cho above-the-fold content
- Defer non-critical CSS

**JavaScript:**
- Async/defer non-critical scripts
- Code splitting (load per section)
- Minimize third-party scripts

**Images:**
- WebP với JPG fallback
- Responsive images (srcset)
- Lazy loading
- LQIP (Low-Quality Image Placeholders)

**Caching:**
- Browser caching headers (1 year for static assets)
- CDN for global delivery
- Service worker (optional PWA)

**Fonts:**
- Self-host hoặc use system fonts fallback
- Font-display: swap (avoid FOIT)
- Subset fonts (only Vietnamese + Latin characters)

### 15.3. Analytics & Tracking

**Google Analytics 4:**
- Page views
- Scroll depth
- Button clicks (CTAs)
- Form submissions
- Product views

**Custom Events:**
```javascript
// CTA clicks
gtag('event', 'cta_click', {
  'section': 'hero',
  'button_text': 'Xem sản phẩm ngay'
});

// QR demo
gtag('event', 'qr_demo_click', {
  'location': 'traceability_section'
});

// Newsletter signup
gtag('event', 'newsletter_signup', {
  'method': 'footer'
});
```

**Heatmaps:** Hotjar hoặc tương tự để track:
- Click patterns
- Scroll depth
- Session recordings

---

## ✅ TÓM TẮT & CHECKLIST

### Landing Page hoàn chỉnh bao gồm:

✅ **Hero** - Hook trong 3 giây, video/ảnh đẹp, CTAs rõ ràng  
✅ **Value Props** - 3 trụ cột: Minh bạch, Hương vị, Tác động  
✅ **Products** - Showcase best sellers, dễ add to cart  
✅ **Traceability** - USP chính, demo QR interactive  
✅ **Cô Tô Origin** - Storytelling, giải thích "tại sao đặc biệt"  
✅ **Sustainability** - Quy trình bền vững, commitments cụ thể  
✅ **CSR Impact** - Số liệu thật, Quỹ Biển Sạch, Chương trình Bến Mới  
✅ **Testimonials** - Social proof với ratings, quotes thật  
✅ **Final CTA** - Strong push cuối, clear next steps  
✅ **Footer** - Full info, newsletter, legal links

### Technical Checklist:

✅ Mobile-responsive (mobile-first)  
✅ Performance: LCP < 2.5s, FCP < 1.5s  
✅ Accessibility: WCAG 2.1 AA  
✅ SEO: Meta tags, structured data, heading hierarchy  
✅ Browser support: Last 2 versions major browsers  
✅ Images: WebP + lazy loading  
✅ Typography: Montserrat + Inter + Roboto Mono  
✅ Colors: Brand palette strictly followed  
✅ Animations: Smooth, purposeful, không quá  

### Pre-Launch Checklist:

- [ ] Content finalized & proofread
- [ ] Images optimized & compressed
- [ ] Videos processed & compressed
- [ ] All links work (internal + external)
- [ ] Forms functional (newsletter, contact)
- [ ] Analytics installed & tested
- [ ] Performance tested (Lighthouse score >90)
- [ ] Mobile tested (real devices)
- [ ] Cross-browser tested
- [ ] Accessibility audit passed
- [ ] Legal pages ready (Privacy, Terms)
- [ ] SSL certificate installed
- [ ] Backup & rollback plan ready

---

**Bạn muốn tôi:**
- Tạo wireframe chi tiết hơn cho section cụ thể nào?
- Viết full HTML/CSS code mẫu cho section nào?
- Design mockup visual cho mobile/desktop?
- Tạo content calendar cho post-launch marketing?