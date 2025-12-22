'use client'

import { useEffect } from 'react'

import { Button } from '@shared/ui/button'
import { Label } from '@shared/ui/label'
import { Input } from '@shared/ui/input'
import { Plus, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@shared/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/ui/select'
import type { BrandMemory } from '@/core/domain/brand-memory'
import { usePostStore } from '../_store/usePostStore'

export default function PostContentSettings() {
  const {
    isPostContentSettingsOpen,
    closePostContentSettings,
    brand: settings,
    products,
    isLoadingProducts,
    productsError,
    loadProducts,
    setBrand: setSettings,
    toggleProduct,
    resetSettings,
  } = usePostStore()

  useEffect(() => {
    if (isPostContentSettingsOpen) {
      loadProducts()
    }
  }, [isPostContentSettingsOpen, loadProducts])

  const handleReset = () => {
    resetSettings()
  }

  // Helper to add item to array field
  const addArrayItem = (field: 'ctaLibrary' | 'keyPoints' | 'writingPatterns') => {
    if (field === 'writingPatterns') {
      setSettings({
        ...settings,
        brandVoice: {
          ...settings.brandVoice,
          writingPatterns: [...settings.brandVoice.writingPatterns, '']
        }
      })
    } else {
      setSettings({
        ...settings,
        [field]: [...settings[field], '']
      })
    }
  }

  // Helper to update item in array
  const updateArrayItem = (field: 'ctaLibrary' | 'keyPoints' | 'writingPatterns', index: number, value: string) => {
    if (field === 'writingPatterns') {
      const updated = [...settings.brandVoice.writingPatterns]
      updated[index] = value
      setSettings({
        ...settings,
        brandVoice: {
          ...settings.brandVoice,
          writingPatterns: updated
        }
      })
    } else {
      const updated = [...settings[field]]
      updated[index] = value
      setSettings({
        ...settings,
        [field]: updated
      })
    }
  }

  // Helper to remove item from array
  const removeArrayItem = (field: 'ctaLibrary' | 'keyPoints' | 'writingPatterns', index: number) => {
    if (field === 'writingPatterns') {
      setSettings({
        ...settings,
        brandVoice: {
          ...settings.brandVoice,
          writingPatterns: settings.brandVoice.writingPatterns.filter((_: any, i: number) => i !== index)
        }
      })
    } else {
      setSettings({
        ...settings,
        [field]: settings[field].filter((_: any, i: number) => i !== index)
      })
    }
  }

  if (isLoadingProducts) {
    return (
      <Dialog open={isPostContentSettingsOpen} onOpenChange={closePostContentSettings}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Brand Settings</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading products...</div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (productsError) {
    return (
      <Dialog open={isPostContentSettingsOpen} onOpenChange={closePostContentSettings}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Brand Settings</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-red-500">Error: {productsError}</div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isPostContentSettingsOpen} onOpenChange={closePostContentSettings}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Brand Settings</DialogTitle>
          <DialogDescription>
            Make changes to your setting for AI Generation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Brand Description */}
          <div className="space-y-2">
            <Label htmlFor="brandDescription">
              Brand Description
              <span className="text-xs text-gray-500 ml-2">
                General description of your brand and what it represents
              </span>
            </Label>
            <textarea
              id="brandDescription"
              value={settings.brandDescription}
              onChange={(e) =>
                setSettings({ ...settings, brandDescription: e.target.value })
              }
              rows={3}
              className="w-full border rounded-md p-3"
              placeholder="e.g., Premium fresh seafood from Cô Tô Island..."
            />
          </div>

          {/* Niche/Category */}
          <div className="space-y-2">
            <Label htmlFor="niche">
              Niche / Category
              <span className="text-xs text-gray-500 ml-2">
                Your business niche or focus area
              </span>
            </Label>
            <Input
              id="niche"
              value={settings.niche}
              onChange={(e) =>
                setSettings({ ...settings, niche: e.target.value })
              }
              placeholder="e.g., Fresh seafood, ocean-to-table quality"
            />
          </div>

          {/* Content Style */}
          <div className="space-y-2">
            <Label htmlFor="contentStyle">
              Content Style
              <span className="text-xs text-gray-500 ml-2">
                Tone and approach for your posts
              </span>
            </Label>
            <Select
              value={settings.contentStyle}
              onValueChange={(value: BrandMemory['contentStyle']) =>
                setSettings({ ...settings, contentStyle: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">
                  Professional - Formal, trustworthy
                </SelectItem>
                <SelectItem value="casual">
                  Casual - Friendly, conversational
                </SelectItem>
                <SelectItem value="promotional">
                  Promotional - Sales-focused, persuasive
                </SelectItem>
                <SelectItem value="educational">
                  Educational - Informative, helpful
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label htmlFor="language">
              Language
              <span className="text-xs text-gray-500 ml-2">
                Primary language for content
              </span>
            </Label>
            <Select
              value={settings.language}
              onValueChange={(value: BrandMemory['language']) =>
                setSettings({ ...settings, language: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vietnamese">Tiếng Việt</SelectItem>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="bilingual">Bilingual (Việt/Eng)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Brand Voice - Tone */}
          <div className="space-y-2">
            <Label htmlFor="brandVoiceTone">
              Brand Voice - Tone
              <span className="text-xs text-gray-500 ml-2">
                {`Overall tone and personality (e.g., "warm, expert, trustworthy")`}
              </span>
            </Label>
            <Input
              id="brandVoiceTone"
              value={settings.brandVoice.tone}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  brandVoice: { ...settings.brandVoice, tone: e.target.value }
                })
              }
              placeholder="e.g., warm, expert, trustworthy"
            />
          </div>

          {/* Brand Voice - Writing Patterns */}
          <div className="space-y-2">
            <Label>
              Writing Patterns
              <span className="text-xs text-gray-500 ml-2">
                Guidelines for writing style
              </span>
            </Label>
            <div className="space-y-2">
              {settings.brandVoice.writingPatterns.map((pattern: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={pattern}
                    onChange={(e) => updateArrayItem('writingPatterns', index, e.target.value)}
                    placeholder="e.g., Kể chuyện người thật"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem('writingPatterns', index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('writingPatterns')}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Writing Pattern
              </Button>
            </div>
          </div>

          {/* CTA Library */}
          <div className="space-y-2">
            <Label>
              CTA Library
              <span className="text-xs text-gray-500 ml-2">
                Call-to-action templates for posts
              </span>
            </Label>
            <div className="space-y-2">
              {settings.ctaLibrary.map((cta: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={cta}
                    onChange={(e) => updateArrayItem('ctaLibrary', index, e.target.value)}
                    placeholder="e.g., Nhắn tin nhận giá tươi hôm nay"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem('ctaLibrary', index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('ctaLibrary')}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add CTA
              </Button>
            </div>
          </div>

          {/* Key Points */}
          <div className="space-y-2">
            <Label>
              Key Selling Points
              <span className="text-xs text-gray-500 ml-2">
                Main product/service benefits and features
              </span>
            </Label>
            <div className="space-y-2">
              {settings.keyPoints.map((point: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={point}
                    onChange={(e) => updateArrayItem('keyPoints', index, e.target.value)}
                    placeholder="e.g., Đánh bắt trong ngày"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem('keyPoints', index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('keyPoints')}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Key Point
              </Button>
            </div>
          </div>

          {/* Selected Products */}
          <div className="space-y-2">
            <Label>
              Selected Products
              <span className="text-xs text-gray-500 ml-2">
                Products to include in brand context for AI
              </span>
            </Label>
            <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
              {products.map((product: any) => (
                <label key={product.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={settings.selectedProductIds?.includes(product.id.toString()) || false}
                    onChange={() => toggleProduct(product.id.toString())}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">{product.name}</span>
                </label>
              ))}
              {products.length === 0 && (
                <p className="text-sm text-gray-500">No products available</p>
              )}
            </div>
          </div>

          {/* Contents Instruction */}
          <div className="space-y-2">
            <Label htmlFor="contentsInstruction">
              Contents Instruction
              <span className="text-xs text-gray-500 ml-2">
                Guide AI to create post ideas (used for schedule generation)
              </span>
            </Label>
            <textarea
              id="contentsInstruction"
              value={settings.contentsInstruction || ''}
              onChange={(e) =>
                setSettings({ ...settings, contentsInstruction: e.target.value })
              }
              rows={4}
              className="w-full border rounded-md p-3"
              placeholder="e.g., Focus on seasonal products, highlight sustainability, include customer stories..."
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Note:</strong> These settings define your brand voice and are used by AI to generate consistent,
              on-brand content. They are stored in localStorage and persist across sessions.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-between gap-2 pt-4">
            <Button variant="outline" onClick={handleReset}>
              Reset to Default
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={closePostContentSettings}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
