"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"

interface FacebookPage {
  id: string
  name: string
  access_token: string
  category?: string
  tasks?: string[]
}

export default function FacebookPageSelectionPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [pages, setPages] = useState<FacebookPage[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null)

  useEffect(() => {
    const pagesParam = searchParams.get("pages")
    if (pagesParam) {
      try {
        const parsedPages = JSON.parse(decodeURIComponent(pagesParam))
        setPages(parsedPages)
      } catch (error) {
        console.error("Failed to parse pages:", error)
        router.push("/crm/social/connections?error=invalid_pages_data")
      }
    } else {
      router.push("/crm/social/connections?error=missing_pages_data")
    }
  }, [searchParams, router])

  const handleSelectPage = async (page: FacebookPage) => {
    setLoading(true)
    setSelectedPageId(page.id)

    try {
      const response = await fetch("/api/auth/facebook/select-page", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page_id: page.id,
          page_name: page.name,
          page_access_token: page.access_token,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to select page")
      }

      // Success - redirect to connections page
      router.push("/crm/social/connections?success=true&platform=facebook")
    } catch (error) {
      console.error("Error selecting page:", error)
      alert(error instanceof Error ? error.message : "Failed to connect page")
      setLoading(false)
      setSelectedPageId(null)
    }
  }

  if (pages.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Select a Facebook Page</h1>
        <p className="text-gray-600">
          Choose which Facebook Page you want to connect to your CRM
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {pages.map((page) => (
          <div
            key={page.id}
            className={`border rounded-lg p-6 transition-all hover:shadow-lg ${
              selectedPageId === page.id ? "ring-2 ring-blue-500 border-blue-500" : "border-gray-200"
            }`}
          >
            <div className="mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                {page.name}
              </h3>
              {page.category && (
                <p className="text-sm text-gray-500 mt-1">{page.category}</p>
              )}
            </div>
            <button
              onClick={() => handleSelectPage(page)}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
            >
              {loading && selectedPageId === page.id ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Select This Page
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>Note:</strong> After selecting a page, we will subscribe to webhook
          messages to receive customer messages in your CRM.
        </p>
      </div>
    </div>
  )
}
