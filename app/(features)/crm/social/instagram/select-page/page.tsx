"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"

interface InstagramPage {
    id: string
    name: string
    access_token: string
    instagram_business_account?: {
        id: string
    }
}

export default function InstagramPageSelectionPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [pages, setPages] = useState<InstagramPage[]>([])
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
                router.push("/crm/social/connections?error=invalid_pages_data&platform=instagram")
            }
        } else {
            router.push("/crm/social/connections?error=missing_pages_data&platform=instagram")
        }
    }, [searchParams, router])

    const handleSelectPage = async (page: InstagramPage) => {
        setLoading(true)
        setSelectedPageId(page.id)

        try {
            const response = await fetch("/api/auth/instagram/select-page", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    page_id: page.id,
                    page_name: page.name,
                    page_access_token: page.access_token,
                    instagram_business_account_id: page.instagram_business_account?.id || page.id, // Use page.id as fallback for basic connections
                }),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || "Failed to select Instagram page")
            }

            // Success - redirect to connections page
            router.push("/crm/social/connections?success=true&platform=instagram")
        } catch (error) {
            console.error("Error selecting Instagram page:", error)
            alert(error instanceof Error ? error.message : "Failed to connect Instagram page")
            setLoading(false)
            setSelectedPageId(null)
        }
    }

    if (pages.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
            </div>
        )
    }

    return (
        <div className="container max-w-4xl mx-auto py-10 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Select Instagram Business Account</h1>
                <p className="text-gray-600">
                    Choose which Facebook Page with Instagram Business Account you want to connect to your CRM
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {pages.map((page) => (
                    <div
                        key={page.id}
                        className={`border rounded-lg p-6 transition-all hover:shadow-lg ${selectedPageId === page.id ? "ring-2 ring-pink-500 border-pink-500" : "border-gray-200"
                            }`}
                    >
                        <div className="mb-4">
                            <h3 className="text-xl font-semibold flex items-center gap-2">
                                <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 1.707.017.225.093.37.237.526v.012c-.008.09-.023.165-.045.24-.084.626-.17 1.644-.515 2.38-.824.09-.048.167-.128.235-.128.069.0.13.038.201-.038.115-.061.22-.127.3-.299.192-.168.43-.389.573-.641.334-.483.614-1.12.614-1.906 0-.705-.225-1.288-.614-1.906-.204-.297-.389-.683-.573-1.12-.334-.172-.23-.336-.448-.492-.729-.151-.273-.281-.568-.391-.887-.197-.651-.142-1.318.113-1.872.065-.115.143-.212.23-.336.331-.264.201-.628.352-1.088.352-.453 0-.832-.067-1.135-.2-.099-.045-.271.052-.28.191-.007.15.019.312.077.465.058.153.112.248.176.298.008.018.015.036.015.054 0 .021-.009.041-.015.054-.054.301-.11.656-.263 1.063-.463.363-.196.688-.439.955-.735.268-.295.46-.645.568-1.047.354-.732.552-1.668.552-2.815 0-1.18-.218-2.086-.655-2.715-.437-.629-1.012-.943-1.726-.943-.714 0-1.289.314-1.726.943-.437.629-.655 1.535-.655 2.715 0 1.147.198 2.083.552 2.815.108.402.3.752.568 1.047.735.268.295.46.645.568 1.047.354.732.552 1.668.552 2.815 0 1.18-.218 2.086-.655 2.715-.437.629-1.012.943-1.726.943-.714 0-1.289-.314-1.726-.943-.437-.629-.655-1.535-.655-2.715z" />
                                </svg>
                                {page.name}
                            </h3>
                            {page.instagram_business_account && (
                                <p className="text-sm text-pink-600 mt-1">
                                    Instagram Business ID: {page.instagram_business_account.id}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={() => handleSelectPage(page)}
                            disabled={loading}
                            className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
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
                                    Connect Instagram Business
                                </>
                            )}
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-8 p-4 bg-pink-50 border border-pink-200 rounded-lg">
                <p className="text-sm text-gray-700">
                    <strong>Note:</strong> After connecting, we will subscribe to Instagram webhook
                    events to receive comments, mentions, and story insights in your CRM.
                </p>
            </div>
        </div>
    )
}
