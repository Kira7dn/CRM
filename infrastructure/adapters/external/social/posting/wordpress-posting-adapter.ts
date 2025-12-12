import type { PostMetrics, PostMedia } from "@/core/domain/marketing/post";
import type { WordPressAuthService } from "../auth/wordpress-auth-service";
import { BasePostingAdapter } from "./base-posting-service";
import type { PostingPublishRequest, PostingPublishResponse } from "@/core/application/interfaces/marketing/posting-adapter";

interface WordPressPostResponse {
    ID?: number; // WordPress.com uses uppercase ID
    id?: number; // Self-hosted uses lowercase id
    title: string;
    content: string;
    status: string;
    URL?: string; // WordPress.com uses uppercase URL
    link?: string; // Self-hosted uses lowercase link
    date: string;
    modified: string;
    featured_media?: number;
    categories?: number[];
    tags?: number[];
    comment_count?: number;
    error?: string;
    message?: string;
}

/**
 * WordPress Posting Adapter
 * Handles publishing content to WordPress sites (both WordPress.com and self-hosted)
 */
export class WordPressPostingAdapter extends BasePostingAdapter {
    platform = "wordpress" as const;

    constructor(private auth: WordPressAuthService) {
        super();
    }

    private getAuthData() {
        // Determine token type based on available data
        const authData = this.auth.getAuthData();
        const isWpCom = !!authData.siteId && !authData.siteUrl?.includes('wp-json');

        return {
            accessToken: this.auth.getAccessToken(),
            tokenType: isWpCom ? "wpcom" as const : "self-host" as const,
            siteUrl: authData.siteUrl,
            siteId: authData.siteId,
        };
    }

    private getEndpoint(path: string): string {
        const auth = this.getAuthData();

        this.log("Building WordPress endpoint", {
            tokenType: auth.tokenType,
            hasSiteId: !!auth.siteId,
            hasSiteUrl: !!auth.siteUrl,
            siteId: auth.siteId,
            siteUrl: auth.siteUrl,
            path,
        });

        if (auth.tokenType === "wpcom") {
            if (!auth.siteId) {
                throw new Error("Site ID is required for WordPress.com");
            }

            // For WordPress.com, use /posts/new for creating new posts
            const endpointPath = path === "posts" ? "posts/new" : path;
            const endpoint = `https://public-api.wordpress.com/rest/v1.1/sites/${auth.siteId}/${endpointPath}`;

            this.log("WordPress.com endpoint", {
                endpoint,
                originalPath: path,
                finalPath: endpointPath,
                note: "Using /posts/new for creating posts on WordPress.com"
            });

            return endpoint;
        } else {
            if (!auth.siteUrl) {
                throw new Error("Site URL is required for self-hosted WordPress");
            }
            const endpoint = `${auth.siteUrl.replace(/\/$/, "")}/wp-json/wp/v2/${path}`;
            this.log("Self-hosted WordPress endpoint", { endpoint });
            return endpoint;
        }
    }

    private getHeaders(): Record<string, string> {
        const auth = this.getAuthData();

        this.log("WordPress API headers", {
            hasAuthorization: !!auth.accessToken,
            contentType: "application/json",
        });

        return {
            Authorization: `Bearer ${auth.accessToken}`,
            "Content-Type": "application/json",
        };
    }

    async publish(request: PostingPublishRequest): Promise<PostingPublishResponse> {
        try {
            if (!request.title && !request.body) {
                return {
                    success: false,
                    error: "Title or body is required for WordPress post",
                };
            }

            const content = this.formatContent(request);
            const postData = this.buildWordPressPostData(request, content);

            let endpoint = this.getEndpoint("posts");
            let response = await this.makeRequest(endpoint, postData);

            // If 404 and using WordPress.com, try v2 API
            if (!response.ok && response.status === 404) {
                const auth = this.getAuthData();
                if (auth.tokenType === "wpcom" && auth.siteId) {
                    this.log("Trying WordPress.com v2 API as fallback");
                    endpoint = `https://public-api.wordpress.com/rest/v2/sites/${auth.siteId}/posts`;
                    response = await this.makeRequest(endpoint, postData);
                }
            }

            const responseText = await response.text();
            this.log("WordPress response", {
                status: response.status,
                responseText: responseText.substring(0, 200),
                isJson: responseText.trim().startsWith('{') || responseText.trim().startsWith('[')
            });

            if (!response.ok) {
                return {
                    success: false,
                    error: `HTTP ${response.status}: ${response.statusText} - ${responseText}`,
                };
            }

            let data: WordPressPostResponse;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                return {
                    success: false,
                    error: `Invalid JSON response from WordPress: ${responseText.substring(0, 200)}`,
                };
            }

            if (data.error) {
                return {
                    success: false,
                    error: data.error || data.message || "Failed to publish WordPress post",
                };
            }

            return {
                success: true,
                postId: (data.ID ?? data.id)?.toString() ?? "",
                permalink: data.URL ?? data.link ?? "",
            };
        } catch (error) {
            this.logError("Failed to publish WordPress post", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    async update(postId: string, request: PostingPublishRequest): Promise<PostingPublishResponse> {
        try {
            const content = this.formatContent(request);
            const postData = this.buildWordPressPostData(request, content);

            const endpoint = this.getEndpoint(`posts/${postId}`);
            const response = await this.makeRequest(endpoint, postData);

            const data: WordPressPostResponse = await response.json();

            if (!response.ok || data.error) {
                return {
                    success: false,
                    error: data.error || data.message || "Failed to update WordPress post",
                };
            }

            return {
                success: true,
                postId: (data.ID ?? data.id)?.toString() ?? "",
                permalink: data.URL ?? data.link ?? "",
            };
        } catch (error) {
            this.logError("Failed to update WordPress post", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    async verifyAuth(): Promise<boolean> {
        try {
            const endpoint = this.getEndpoint("users/me");
            const response = await fetch(endpoint, {
                method: "GET",
                headers: this.getHeaders(),
            });

            return response.ok;
        } catch (error) {
            this.logError("Failed to verify WordPress authentication", error);
            return false;
        }
    }

    async delete(postId: string): Promise<boolean> {
        try {
            console.log(`[WordPressPostingAdapter] Deleting WordPress post:`, { postId });

            // WordPress.com API uses POST to /delete/ endpoint instead of DELETE method
            const endpoint = this.getEndpoint(`posts/${postId}/delete`);
            console.log(`[WordPressPostingAdapter] Delete endpoint:`, endpoint);

            const response = await fetch(endpoint, {
                method: "POST", // Use POST method for WordPress.com delete endpoint
                headers: this.getHeaders(),
            });

            console.log(`[WordPressPostingAdapter] Delete response:`, {
                status: response.status,
                ok: response.ok,
                statusText: response.statusText
            });

            // WordPress.com delete endpoint returns 200 OK on successful deletion
            if (response.ok) {
                const data = await response.json();
                console.log(`[WordPressPostingAdapter] Delete successful:`, data);
                return true;
            } else {
                const errorText = await response.text();
                console.error(`[WordPressPostingAdapter] Delete failed:`, {
                    status: response.status,
                    statusText: response.statusText,
                    errorText
                });
                return false;
            }
        } catch (error) {
            console.error(`[WordPressPostingAdapter] Delete error:`, error);
            this.logError("Failed to delete WordPress post", error);
            return false;
        }
    }

    async getMetrics(postId: string): Promise<PostMetrics> {
        try {
            const endpoint = this.getEndpoint(`posts/${postId}`);
            const response = await fetch(endpoint, {
                method: "GET",
                headers: this.getHeaders(),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch post data");
            }

            const data: WordPressPostResponse = await response.json();

            const metrics: PostMetrics = {
                views: 0,
                likes: 0,
                comments: 0,
                shares: 0,
                reach: 0,
                engagement: 0,
                lastSyncedAt: new Date(),
            };

            // Get comment count
            if (data.comment_count !== undefined) {
                metrics.comments = data.comment_count;
            } else {
                // Fallback: fetch comments separately
                try {
                    const commentsEndpoint = this.getEndpoint(`comments?post=${postId}`);
                    const commentsResponse = await fetch(commentsEndpoint, {
                        method: "GET",
                        headers: this.getHeaders(),
                    });

                    if (commentsResponse.ok) {
                        const commentsData = await commentsResponse.json();
                        metrics.comments = Array.isArray(commentsData) ? commentsData.length : 0;
                    }
                } catch {
                    // Ignore comment fetch errors, keep 0
                }
            }

            return metrics;
        } catch (error) {
            this.logError("Failed to get WordPress metrics", error);
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

    private async makeRequest(endpoint: string, postData: any): Promise<Response> {
        this.log("Making WordPress request", {
            endpoint,
            hasTitle: !!postData.title,
            hasBody: !!postData.content,
        });

        return await fetch(endpoint, {
            method: "POST",
            headers: this.getHeaders(),
            body: JSON.stringify(postData),
        });
    }

    private formatContent(request: PostingPublishRequest): string {
        let content = "";

        if (request.body) {
            content = request.body;
        }

        if (request.mentions && request.mentions.length > 0) {
            const mentionText = request.mentions
                .map(mention => `@${mention}`)
                .join(" ");
            content += content ? `\n\n${mentionText}` : mentionText;
        }

        if (request.hashtags && request.hashtags.length > 0) {
            const hashtagText = request.hashtags
                .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
                .join(" ");
            content += content ? `\n\n${hashtagText}` : hashtagText;
        }

        return content;
    }

    private buildWordPressPostData(request: PostingPublishRequest, content: string): any {
        const postData: any = {
            title: request.title || "Untitled",
            content,
            status: "publish",
            excerpt: request.body ? request.body.substring(0, 160) : "",
        };

        if (request.media.length > 0) {
            const firstMedia = request.media[0];
            if (firstMedia.type === "image") {
                postData.featured_media = 0; // Placeholder for media ID
            }
        }

        return postData;
    }

    protected formatMessage(request: PostingPublishRequest): string {
        // WordPress HTML formatting with Gutenberg blocks
        let content = "";

        if (request.title) {
            content += `<!-- wp:heading {"level":1} -->\n<h1>${request.title}</h1>\n<!-- /wp:heading -->\n\n`;
        }

        if (request.body) {
            content += `<!-- wp:paragraph -->\n<p>${request.body.replace(/\n/g, "</p>\n\n<p>")}</p>\n<!-- /wp:paragraph -->`;
        }

        if (request.hashtags && request.hashtags.length > 0) {
            const hashtags = request.hashtags
                .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
                .join(" ");
            content += `\n\n<!-- wp:paragraph -->\n<p><strong>Tags:</strong> ${hashtags}</p>\n<!-- /wp:paragraph -->`;
        }

        if (request.mentions && request.mentions.length > 0) {
            const mentions = request.mentions
                .map(mention => `@${mention}`)
                .join(" ");
            content += `\n\n<!-- wp:paragraph -->\n<p><strong>Mentions:</strong> ${mentions}</p>\n<!-- /wp:paragraph -->`;
        }

        return content;
    }
}
