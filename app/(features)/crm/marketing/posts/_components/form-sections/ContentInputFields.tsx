'use client'

import { Label } from '@shared/ui/label'
import { Input } from '@shared/ui/input'
import { Button } from '@shared/ui/button'
import { Sparkles } from 'lucide-react'

interface ContentInputFieldsProps {
  title: string
  setTitle: (title: string) => void
  body: string
  setBody: (body: string) => void
  variations: Array<{ title: string; content: string; style: string }>
  setVariations: (variations: Array<{ title: string; content: string; style: string }>) => void
  idea?: string
  setIdea?: (idea: string) => void
  contentInstruction?: string
  setContentInstruction?: (instruction: string) => void
  selectedProduct?: { id: number; name: string; url?: string } | null
  setSelectedProduct?: (product: { id: number; name: string; url?: string } | null) => void
  products?: Array<{ id: number; name: string; url?: string }>
}

export default function ContentInputFields({
  title,
  setTitle,
  body,
  setBody,
  variations,
  setVariations,
  idea,
  setIdea,
  contentInstruction,
  setContentInstruction,
  selectedProduct,
  setSelectedProduct,
  products = [],
}: ContentInputFieldsProps) {
  return (
    <>
      {/* Post Idea (NEW) */}
      {setIdea && (
        <div>
          <Label htmlFor="idea">Post Idea (from schedule or custom)</Label>
          <textarea
            id="idea"
            value={idea || ''}
            onChange={(e) => setIdea(e.target.value)}
            rows={2}
            placeholder="e.g., Highlight sustainable fishing practices..."
            className="w-full border rounded-md p-3"
          />
        </div>
      )}

      {/* Product Selection (NEW) */}
      {setSelectedProduct && products.length > 0 && (
        <div>
          <Label htmlFor="product">Product (optional)</Label>
          <select
            id="product"
            value={selectedProduct?.id || ''}
            onChange={(e) => {
              const productId = parseInt(e.target.value)
              const product = products.find(p => p.id === productId)
              setSelectedProduct(product || null)
            }}
            className="w-full border rounded-md p-2"
          >
            <option value="">None (no specific product)</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
          {selectedProduct?.url && (
            <p className="text-xs text-gray-500 mt-1">
              Product URL: <a href={selectedProduct.url} target="_blank" rel="noopener noreferrer" className="underline">{selectedProduct.url}</a>
            </p>
          )}
        </div>
      )}

      {/* Detail Content Instruction (NEW) */}
      {setContentInstruction && (
        <div>
          <Label htmlFor="contentInstruction">Specific Instructions for this Post</Label>
          <textarea
            id="contentInstruction"
            value={contentInstruction || ''}
            onChange={(e) => setContentInstruction(e.target.value)}
            rows={3}
            placeholder="e.g., Emphasize premium quality, include customer testimonial, add urgency..."
            className="w-full border rounded-md p-3"
          />
        </div>
      )}

      {/* Title */}
      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          name="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Content Body */}
      <div>
        <Label htmlFor="body">Content</Label>
        <textarea
          id="body"
          name="body"
          rows={6}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full border rounded-md p-3"
        />
      </div>

      {/* Variations Selector */}
      {variations.length > 0 && (
        <div className="border rounded-lg p-4 space-y-3 bg-blue-50 dark:bg-blue-900/10">
          <h3 className="font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            AI Generated Variations
          </h3>
          <div className="space-y-2">
            {variations.map((variation, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setTitle(variation.title)
                  setBody(variation.content)
                }}
                className="w-full text-left p-3 border rounded-md hover:bg-white dark:hover:bg-gray-800 bg-white dark:bg-gray-900 transition-colors"
              >
                <div className="font-medium text-xs text-gray-500 uppercase mb-1">
                  {variation.style}
                </div>
                <div className="font-semibold text-sm mb-1">{variation.title}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {variation.content}
                </div>
              </button>
            ))}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setVariations([])}
          >
            Hide Variations
          </Button>
        </div>
      )}
    </>
  )
}
