# Landing Page - Ngày Mới Cô Tô

## Tổng quan

Landing page được refactor hoàn toàn theo Clean Architecture với các section components modular, tái sử dụng được và tuân thủ design system từ [landing-page.md](../../landing-page.md).

## Cấu trúc thư mục

```
app/(landing-page)/
├── page.tsx                      # Main landing page (orchestrator)
├── components/
│   ├── Header.tsx               # Sticky navigation header (existing)
│   ├── ui/                      # Reusable UI components
│   │   ├── index.ts            # Export all UI components
│   │   ├── Container.tsx       # Layout container with variants
│   │   ├── SectionHeading.tsx  # Section headings with typography variants
│   │   ├── Card.tsx            # Generic card with style variants
│   │   ├── Badge.tsx           # Product badges (New, Best Seller, etc.)
│   │   └── AnimatedCounter.tsx # Animated number counter for metrics
│   └── sections/               # Landing page sections
│       ├── index.ts            # Export all sections
│       ├── HeroSection.tsx     # Hero with animated bubbles + carousel
│       ├── HeroCarousel.tsx   # Image carousel for hero section
│       ├── ValuePropsSection.tsx # 3 value propositions
│       ├── ProductsSection.tsx  # Product carousel
│       ├── TraceabilitySection.tsx # QR code demo & traceability
│       ├── TestimonialsSection.tsx # Customer reviews
│       ├── CSRSection.tsx      # Social impact metrics
│       ├── FinalCTASection.tsx # Final conversion CTA
│       └── Footer.tsx          # Complete footer with newsletter
└── README.md                    # This file
```

## Các Section Components

### 1. HeroSection
- **Animated Background**: SVG bubbles với gradient (blue-900 → blue-800 → cyan-700)
- **Gradient Orbs**: Cyan và yellow với blur-3xl và animate-pulse
- **Grid Layout**: Text content (lg:col-span-4) + HeroCarousel (lg:col-span-6)
- **Animated Title**:
  - Line 1: White với 3D rotateX transform
  - Line 2: Gradient text (yellow-white-yellow) với animated gradient shift
  - Line 3: Cyan với 3D transform và glow effects
- **Content từ brandConfig**: tagline, hero.title, brand.description, CTAs
- **Trust Badges**: Truy xuất 100%, Tươi <30 phút, Bền vững
- **Animations**: Sử dụng animate-fade-in-up, animate-float, animate-pulse từ globals.css

**Props:**
```typescript
{
  className?: string;
}
```

### 2. ValuePropsSection
- 3 cột value propositions:
  - Minh bạch 100%
  - Hương vị đặc biệt
  - Tác động tích cực
- Icons với hover effects
- Links to relevant sections

### 3. ProductsSection
- Carousel với Embla
- Product cards với badges (New, Best Seller, Premium)
- Star ratings
- Add to cart buttons

### 4. TraceabilitySection
- QR code demo (interactive)
- 4-step traceability journey
- Click to expand details
- Trust statement

### 5. TestimonialsSection
- Customer testimonials carousel
- 5-star ratings
- Avatar, name, location
- Stats: 10K+ customers, 4.9 rating, 98% satisfaction

### 6. CSRSection
- Animated counter metrics (500M VND, 150+ fishermen, 10K kg waste)
- Icons for each metric
- Story section with image
- Bullet list of impacts

### 7. FinalCTASection
- Gradient background (Crystal to Blue)
- Strong CTA: "Mua ngay - Giảm 15%"
- Contact info (phone, email)
- Trust statement

### 8. Footer
- Newsletter signup form
- 4-column layout:
  - Brand info + social links
  - Company links
  - Product links
  - Contact info
- Bottom bar with copyright & legal links

## UI Components

### Container
Layout wrapper với max-width và padding variants.

**Variants:**
- `size`: `full` | `default` (1200px) | `text` (720px)
- `padding`: `none` | `sm` | `default` | `lg`

**Usage:**
```tsx
<Container size="default" padding="default">
  Content here
</Container>
```

### SectionHeading
Typography component cho section headings.

**Variants:**
- `level`: `h1` | `h2` | `h3` | `h4`
- `color`: `default` | `white` | `crystal` | `golden`
- `align`: `left` | `center` | `right`

**Props:**
- `subtitle`: Optional subtitle text
- `showDecorator`: Show decorative line
- `decoratorColor`: `crystal` | `golden`

**Usage:**
```tsx
<SectionHeading
  level="h2"
  showDecorator
  decoratorColor="crystal"
  subtitle="Optional subtitle"
>
  Heading Text
</SectionHeading>
```

### Card
Generic card component với multiple variants.

**Variants:**
- `variant`: `default` | `bordered` | `shadowed` | `elevated` | `gradient` | `sand`
- `padding`: `none` | `sm` | `default` | `lg`
- `hover`: `none` | `lift` | `scale`

**Usage:**
```tsx
<Card variant="shadowed" hover="lift">
  Card content
</Card>
```

### Badge
Product labels và tags.

**Variants:**
- `variant`: `default` | `primary` | `golden` | `success` | `warning` | `danger` | `outline` | `new` | `premium` | `bestseller`
- `size`: `sm` | `default` | `lg`

**Usage:**
```tsx
<Badge variant="bestseller" size="sm">
  Bán chạy
</Badge>
```

### AnimatedCounter
Animated number counter với intersection observer.

**Props:**
- `value`: Target number
- `duration`: Animation duration (ms)
- `prefix`: Text before number
- `suffix`: Text after number
- `decimals`: Decimal places
- `separator`: Thousands separator

**Usage:**
```tsx
<AnimatedCounter
  value={500}
  suffix=" triệu"
  duration={2500}
/>
```

## Design System

### Brand Colors
Defined in `app/globals.css`:

```css
--brand-crystal: #1CE7ED;   /* Crystal Sea - Cyan */
--brand-golden: #FADE3F;    /* Golden Dawn - Yellow/Gold */
--brand-sand: #F4EBDD;      /* Sand - Light beige background */
--brand-charcoal: #2B2B2B;  /* Charcoal - Dark gray text */
```

### Typography Scale

**Desktop:**
- H1: 48-56px (3-3.5rem)
- H2: 36-40px (2.25-2.5rem)
- H3: 28-32px (1.75-2rem)
- H4: 24px (1.5rem)
- Body: 16px (1rem)

**Mobile (~64% scale):**
- H1: 32-36px
- H2: 24-28px
- H3: 20-22px
- H4: 18px
- Body: 16px

### Spacing System
Base unit: 4px

```
xs:   4px
sm:   8px
base: 16px
md:   24px
lg:   32px
xl:   48px
2xl:  64px
3xl:  96px
```

## Responsive Design

All components follow mobile-first approach với breakpoints:

- Mobile: < 768px
- Tablet: 768px - 1023px
- Desktop: ≥ 1024px

### Key Responsive Features:
- Hero: Grid 1 column on mobile, 10 columns (4+6) on desktop, text center on mobile/left on desktop
- Navigation: Tabs với IntersectionObserver để auto-highlight active section
- Product carousel: 1 card mobile, 2 tablet, 3 desktop
- Grid layouts: Stack on mobile
- Typography: Scales down on mobile
- Padding/spacing: Reduces on mobile
- Animated bubbles: Full responsive với absolute positioning

## Performance Optimizations

1. **Images:**
   - Next.js Image component with lazy loading
   - WebP format preferred
   - Proper sizing with `fill` or explicit dimensions

2. **Animations:**
   - CSS animations over JS where possible
   - IntersectionObserver for scroll-triggered animations
   - Will-change hints for animated properties

3. **Components:**
   - Server Components by default
   - Client Components only when needed (`"use client"`)
   - Proper code splitting

## Navigation & Section IDs

Header navigation tabs scroll to these section IDs:
- **value-props** → ValuePropsSection
- **products** → ProductsSection
- **traceability** → TraceabilitySection (có sẵn id trong component)
- **testimonials** → TestimonialsSection
- **csr** → CSRSection (có sẵn id trong component)
- **contact** → FinalCTASection (có sẵn id trong component)

Header sử dụng IntersectionObserver để auto-highlight active section khi scroll.

## Cách sử dụng

### Import sections:
```tsx
import { HeroSection, ValuePropsSection, ProductsSection } from "./components/sections";
```

### Import UI components:
```tsx
import { Container, Card, Badge } from "./components/ui";
```

### Compose page:
```tsx
export default function LandingPage() {
  return (
    <div>
      <Header />
      <main>
        <HeroSection />

        {/* Wrap sections without built-in IDs */}
        <div id="value-props">
          <ValuePropsSection />
        </div>

        <div id="products">
          <ProductsSection />
        </div>

        {/* These sections have IDs built-in */}
        <TraceabilitySection />  {/* id="traceability" */}

        <div id="testimonials">
          <TestimonialsSection />
        </div>

        <CSRSection />  {/* id="csr" */}
        <FinalCTASection />  {/* id="contact" */}
        <Footer />
      </main>
    </div>
  );
}
```

## Testing

Run development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

## Next Steps

1. **Add real images:** Replace placeholder image paths with actual product images
2. **Upload hero carousel images:** Add real seafood images to HeroCarousel
3. **Connect backend:** Integrate with product APIs for ProductsSection
4. **Add form handlers:** Connect FinalCTASection and Footer newsletter to backend
5. **Add analytics:** Track user interactions, scroll depth, CTA clicks
6. **A/B testing:** Test different CTAs, colors, and layouts
7. **Add more sections:** CoToStorySection (origin story), SustainabilitySection (process timeline) when needed
8. **Mobile menu:** Add hamburger menu for mobile navigation

## Notes

- All components use CVA (Class Variance Authority) for variant management
- Design system follows landing-page.md specifications
- Architecture follows CLAUDE.md Clean Architecture principles
- All components are typed with TypeScript
- Accessibility: semantic HTML, ARIA labels where needed
