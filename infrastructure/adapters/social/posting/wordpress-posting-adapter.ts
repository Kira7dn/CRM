import type { PostMetrics } from "@/core/domain/marketing/post";
import type {
    PostingAdapter,
    PostingPublishRequest,
    PostingPublishResponse,
} from "@/core/application/interfaces/marketing/posting-adapter";

/**
 * WordPress site configuration
 */
interface WordPressSiteConfig {
    siteId?: string;      // WordPress.com
    siteUrl?: string;     // Self-hosted
}

interface WordPressPostResponse {
    ID?: number;          // wp.com
    id?: number;          // self-hosted
    link?: string;
    URL?: string;
    comment_count?: number;
    error?: string;
    message?: string;
}

interface WordPressPostPayload {
    title: string;
    content: string;
    status: "publish" | "draft";
    excerpt?: string;
    featured_image?: string; // URL to featured image
}

/**
 * WordPress Posting Adapter
 * - Supports WordPress.com & self-hosted
 * - No auth verification
 * - No logging
 */
export class WordPressPostingAdapter implements PostingAdapter {
    platform = "wordpress" as const;

    constructor(
        private readonly token: string,
        private readonly siteConfig: WordPressSiteConfig
    ) { }

    // ======================================================
    // Publish
    // ======================================================

    async publish(
        request: PostingPublishRequest
    ): Promise<PostingPublishResponse> {
        try {
            if (!request.title && !request.body) {
                return this.fail("Title or body is required for WordPress post");
            }

            const payload = this.buildPayload(request);
            // WordPress.com requires /posts/new endpoint for creating posts
            const endpoint = this.endpoint(this.isWpCom() ? "posts/new" : "posts");

            console.log("[WordPress] Publishing post:", {
                endpoint,
                siteConfig: this.siteConfig,
                payload: { ...payload, content: payload.content?.substring(0, 50) + "..." }
            });

            const data = await this.post<WordPressPostResponse>(
                endpoint,
                payload
            );

            console.log("[WordPress] Publish response:", data);

            if (data.error) {
                return this.fail(data.error || data.message);
            }

            return this.success(data);
        } catch (error) {
            console.error("[WordPress] Publish error:", error);
            return this.fail(error);
        }
    }

    // ======================================================
    // Update
    // ======================================================

    async update(
        postId: string,
        request: PostingPublishRequest
    ): Promise<PostingPublishResponse> {
        try {
            const payload = this.buildPayload(request);
            const data = await this.post<WordPressPostResponse>(
                this.endpoint(`posts/${postId}`),
                payload
            );

            if (data.error) {
                return this.fail(data.error || data.message);
            }

            return this.success(data);
        } catch (error) {
            return this.fail(error);
        }
    }

    // ======================================================
    // Delete
    // ======================================================

    async delete(postId: string): Promise<boolean> {
        try {
            // WordPress.com uses POST /delete
            const path = this.isWpCom()
                ? `posts/${postId}/delete`
                : `posts/${postId}?force=true`;

            const res = await fetch(this.endpoint(path), {
                method: this.isWpCom() ? "POST" : "DELETE",
                headers: this.headers(),
            });

            return res.ok;
        } catch {
            return false;
        }
    }

    // ======================================================
    // Metrics
    // ======================================================

    async getMetrics(postId: string): Promise<PostMetrics> {
        try {
            const data = await this.get<WordPressPostResponse>(
                this.endpoint(`posts/${postId}`)
            );

            return {
                views: 0,
                likes: 0,
                shares: 0,
                reach: 0,
                engagement: 0,
                comments: data.comment_count ?? 0,
                lastSyncedAt: new Date(),
            };
        } catch {
            return {
                views: 0,
                likes: 0,
                comments: 0,
                shares: 0,
                reach: 0,
                engagement: 0,
                lastSyncedAt: new Date(),
            };
        }
    }

    // ======================================================
    // Helpers
    // ======================================================

    private buildPayload(
        request: PostingPublishRequest
    ): WordPressPostPayload {
        const contentParts: string[] = [];

        if (request.body) contentParts.push(request.body);

        if (request.mentions?.length) {
            contentParts.push(
                request.mentions.map((m) => `@${m}`).join(" ")
            );
        }

        if (request.hashtags?.length) {
            contentParts.push(
                request.hashtags
                    .map((t) => (t.startsWith("#") ? t : `#${t}`))
                    .join(" ")
            );
        }

        const payload: WordPressPostPayload = {
            title: request.title ?? "Untitled",
            content: contentParts.join("\n\n"),
            excerpt: request.body?.slice(0, 160),
            status: "publish",
        };

        // Add featured image if media is provided
        if (request.media?.url) {
            payload.featured_image = request.media.url;
        }

        return payload;
    }

    private endpoint(path: string): string {
        if (this.isWpCom()) {
            if (!this.siteConfig.siteId) {
                throw new Error("siteId is required for WordPress.com");
            }
            return `https://public-api.wordpress.com/rest/v1.1/sites/${this.siteConfig.siteId}/${path}`;
        }

        if (!this.siteConfig.siteUrl) {
            throw new Error("siteUrl is required for self-hosted WordPress");
        }

        return `${this.siteConfig.siteUrl.replace(/\/$/, "")}/wp-json/wp/v2/${path}`;
    }

    private headers(): Record<string, string> {
        return {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
        };
    }

    private async get<T>(url: string): Promise<T> {
        const res = await fetch(url, { headers: this.headers() });
        if (!res.ok) throw new Error(res.statusText);
        return res.json() as Promise<T>;
    }

    private async post<T>(
        url: string,
        body: unknown
    ): Promise<T> {
        const res = await fetch(url, {
            method: "POST",
            headers: this.headers(),
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            throw new Error(res.statusText);
        }

        return res.json() as Promise<T>;
    }

    private success(
        data: WordPressPostResponse
    ): PostingPublishResponse {
        const id = data.ID ?? data.id;

        return {
            success: true,
            postId: id?.toString() ?? "",
            permalink: data.URL ?? data.link ?? "",
        };
    }

    private fail(error?: unknown): PostingPublishResponse {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : typeof error === "string"
                        ? error
                        : "WordPress error",
        };
    }

    private isWpCom(): boolean {
        return !!this.siteConfig.siteId;
    }
}
