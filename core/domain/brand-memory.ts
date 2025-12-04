/**
 * Brand Memory Domain Entity
 * Extends ContentSettings from PostContentSettings.tsx
 * Stores brand voice, strategy, and content guidelines
 */

export type ContentStyle = 'professional' | 'casual' | 'promotional' | 'educational'
export type Language = 'vietnamese' | 'english' | 'bilingual'

/**
 * Brand Voice Configuration
 */
export interface BrandVoice {
  tone: string // e.g., "warm, expert, trustworthy"
  writingPatterns: string[] // e.g., ["kể chuyện người thật", "ưu tiên insight chính xác"]
}

/**
 * Brand Memory Entity
 * Represents the structured memory for AI content generation
 */
export interface BrandMemory {
  id: string

  // Basic settings (UPDATED)
  brandDescription: string  // CHANGED from productDescription
  niche: string
  contentStyle: ContentStyle
  language: Language

  // Extended brand memory fields
  brandVoice: BrandVoice
  ctaLibrary: string[] // Call-to-action templates
  keyPoints: string[] // Key product/service selling points

  // NEW: Content instruction for AI
  contentsInstruction?: string  // Guide AI to create post ideas

  // NEW: Selected products
  selectedProductIds?: number[]  // Products for brand context

  // Metadata
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Default brand memory values
 */
export const DEFAULT_BRAND_MEMORY: Omit<BrandMemory, 'id'> = {
  brandDescription: 'Premium fresh seafood from Cô Tô Island, delivered daily',  // CHANGED
  niche: 'Fresh seafood, ocean-to-table quality',
  contentStyle: 'professional',
  language: 'vietnamese',
  brandVoice: {
    tone: 'warm, expert, trustworthy',
    writingPatterns: [
      'Kể chuyện người thật',
      'Ưu tiên thông tin chính xác',
      'Tránh quảng cáo thổi phồng'
    ]
  },
  ctaLibrary: [
    'Nhắn tin nhận giá tươi hôm nay',
    'Đặt hàng nhanh 60s',
    'Gọi ngay để được tư vấn'
  ],
  keyPoints: [
    'Đánh bắt trong ngày',
    'Vận chuyển 0-4 độ C',
    'Hoàn toàn không ướp đá',
    'Cam kết tươi sống'
  ],
  contentsInstruction: '',  // NEW
  selectedProductIds: [],   // NEW
}

/**
 * Validate brand memory data
 */
export function validateBrandMemory(memory: Partial<BrandMemory>): string[] {
  const errors: string[] = []

  if (!memory.brandDescription || memory.brandDescription.trim().length === 0) {
    errors.push('Brand description is required')
  }

  if (!memory.niche || memory.niche.trim().length === 0) {
    errors.push('Niche is required')
  }

  if (!memory.contentStyle) {
    errors.push('Content style is required')
  }

  if (!memory.language) {
    errors.push('Language is required')
  }

  return errors
}
