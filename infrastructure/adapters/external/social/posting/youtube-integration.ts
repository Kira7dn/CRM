import type {
    YouTubeIntegrationService,
    PlatformPublishRequest,
    PlatformPublishResponse,
} from "@/core/application/interfaces/platform-integration-service";
import type { PostMetrics, PostMedia } from "@/core/domain/campaigns/post";

/**
 * YouTube Data API Configuration
 */
export interface YouTubeConfig {
    apiKey: string;
    clientId: string;
    clientSecret: string;
    refreshToken: string
}

/**
 * YouTube API Response Types
 */
interface YouTubeVideoUploadResponse {
    kind: string;
    etag: string;
    id: string;
    snippet?: {
        title: string;
        description: string;
        publishedAt: string;
    };
    status?: {
        uploadStatus: "uploaded" | "processed" | "failed";
        privacyStatus: "public" | "private" | "unlisted";
    };
}

interface YouTubeVideoResponse {
    kind: string;
    items: Array<{
        id: string;
        snippet: {
            title: string;
            description: string;
            publishedAt: string;
        };
        statistics: {
            viewCount: string;
            likeCount: string;
            commentCount: string;
            favoriteCount: string;
        };
        status: {
            uploadStatus: "uploaded" | "processed" | "failed";
            privacyStatus: "public" | "private" | "unlisted";
        };
    }>;
}

interface YouTubeErrorResponse {
    error: {
        code: number;
        message: string;
        errors: Array<{
            domain: string;
            reason: string;
            message: string;
        }>;
    };
}

/**
 * YouTube Data API v3 Integration
 * Implements uploading and managing videos on YouTube
 *
 * Required OAuth Scopes:
 * - https://www.googleapis.com/auth/youtube.upload
 * - https://www.googleapis.com/auth/youtube
 * - https://www.googleapis.com/auth/youtube.force-ssl
 *
 * API Documentation: https://developers.google.com/youtube/v3
 */
export class YouTubeIntegration implements YouTubeIntegrationService {
    platform = "youtube" as const;
    private baseUrl = "https://www.googleapis.com/youtube/v3";
    private uploadUrl = "https://www.googleapis.com/upload/youtube/v3";

    private _accessToken: string | null = null;
    private _tokenExpireTime: number | null = null; // timestamp in ms
    private config: YouTubeConfig;
    private static instance: YouTubeIntegration | null = null;

    constructor(config: YouTubeConfig) {
        this.config = config;
    }

    /**
     * Initialize the YouTube integration by obtaining an access token
     * @throws {Error} If initialization fails
     */
    async initialize(): Promise<void> {
        try {
            // Kiểm tra nếu access token hiện tại vẫn còn hiệu lực
            if (this._accessToken && this._tokenExpireTime && Date.now() < this._tokenExpireTime) {
                console.log('Using existing access token');
                return;
            }

            console.log('Refreshing YouTube access token...');
            const { accessToken, expiresIn } = await this.refreshAccessToken();

            // Lưu access token và thời gian hết hạn (trừ đi 5 phút để đảm bảo an toàn)
            this._accessToken = accessToken;
            this._tokenExpireTime = Date.now() + (expiresIn * 1000) - (5 * 60 * 1000);

            console.log('Successfully refreshed YouTube access token');
        } catch (error) {
            console.error('Failed to initialize YouTube integration:', error);
            throw new Error(`Failed to initialize YouTube integration: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get singleton instance of YouTubeIntegration
     */
    public static getInstance(config: YouTubeConfig): YouTubeIntegration {
        if (!YouTubeIntegration.instance) {
            YouTubeIntegration.instance = new YouTubeIntegration(config);
        }
        return YouTubeIntegration.instance;
    }

    // Phương thức để lấy accessToken hiện tại, đảm bảo nó đã được làm mới
    private async getValidAccessToken(): Promise<string> {
        // Nếu chưa có accessToken hoặc nó có vẻ đã hết hạn (chúng ta không có expire_in chính xác ở đây,
        // nhưng một ứng dụng thực tế sẽ lưu trữ nó)
        // Để đơn giản, chúng ta sẽ làm mới mỗi lần nếu _accessToken rỗng, hoặc dựa vào lỗi API.
        if (!this._accessToken || this._tokenExpireTime && Date.now() > this._tokenExpireTime) {
            const tokenResponse = await this.refreshAccessToken();
            this._accessToken = tokenResponse.accessToken;
            this._tokenExpireTime = Date.now() + tokenResponse.expiresIn * 1000;
        }
        return this._accessToken as string;
    }

    /**
     * Publish video to YouTube
     */
    async publish(request: PlatformPublishRequest): Promise<PlatformPublishResponse> {
        try {
            // YouTube requires video media
            const videoMedia = request.media.find((m) => m.type === "video");
            if (!videoMedia) {
                return {
                    success: false,
                    error: "YouTube requires video content",
                };
            }

            // Upload video
            const videoId = await this.uploadVideo(videoMedia, request.title, this.formatDescription(request));

            // Wait for processing
            const status = await this.waitForProcessing(videoId);
            if (status !== "ready") {
                return {
                    success: false,
                    error: `Video processing failed with status: ${status}`,
                };
            }

            return {
                success: true,
                postId: videoId,
                permalink: `https://www.youtube.com/watch?v=${videoId}`,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    /**
     * Update existing YouTube video
     */
    async update(postId: string, request: PlatformPublishRequest): Promise<PlatformPublishResponse> {
        try {
            const token = await this.getValidAccessToken(); // Lấy token hợp lệ
            const url = `${this.baseUrl}/videos`;
            const params = new URLSearchParams({
                part: "snippet,status",
            });

            const response = await fetch(`${url}?${params.toString()}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: postId,
                    snippet: {
                        title: request.title,
                        description: this.formatDescription(request),
                        categoryId: "22", // People & Blogs
                        tags: request.hashtags,
                    },
                    status: {
                        privacyStatus: "public",
                    },
                }),
            });

            const data = await response.json();

            if (data.error) {
                return {
                    success: false,
                    error: (data as YouTubeErrorResponse).error.message,
                };
            }

            return {
                success: true,
                postId,
                permalink: `https://www.youtube.com/watch?v=${postId}`,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    /**
     * Delete YouTube video
     */
    async delete(postId: string): Promise<boolean> {
        try {
            const token = await this.getValidAccessToken(); // Lấy token hợp lệ
            const url = `${this.baseUrl}/videos`;
            const params = new URLSearchParams({
                id: postId,
            });

            const response = await fetch(`${url}?${params.toString()}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response.status === 204;
        } catch (error) {
            console.error("Failed to delete YouTube video:", error);
            return false;
        }
    }

    /**
     * Get metrics for a YouTube video
     */
    async getMetrics(postId: string): Promise<PostMetrics> {
        try {
            const token = await this.getValidAccessToken(); // Lấy token hợp lệ
            const url = `${this.baseUrl}/videos`;
            const params = new URLSearchParams({
                part: "statistics,snippet",
                id: postId,
            });

            const response = await fetch(`${url}?${params.toString()}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data: YouTubeVideoResponse = await response.json();

            if (!data.items || data.items.length === 0) {
                throw new Error("Video not found");
            }

            const video = data.items[0];
            const stats = video.statistics;

            return {
                views: parseInt(stats.viewCount) || 0,
                likes: parseInt(stats.likeCount) || 0,
                comments: parseInt(stats.commentCount) || 0,
                shares: 0, // YouTube doesn't provide share count via API
                reach: parseInt(stats.viewCount) || 0,
                engagement: parseInt(stats.likeCount) + parseInt(stats.commentCount),
                lastSyncedAt: new Date(),
            };
        } catch (error) {
            console.error("Failed to get YouTube metrics:", error);
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

    /**
     * Verify YouTube authentication
     */
    async verifyAuth(): Promise<boolean> {
        try {
            const token = await this.getValidAccessToken(); // Lấy token hợp lệ
            const url = `${this.baseUrl}/channels`;
            const params = new URLSearchParams({
                part: "snippet",
                mine: "true",
            });

            const response = await fetch(`${url}?${params.toString()}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();
            return !data.error;
        } catch (error) {
            return false;
        }
    }

    /**
     * Upload video to YouTube using resumable upload protocol
     * Streams video from URL without loading entire file into memory
     * Implements retry logic with exponential backoff for 5xx errors
     */
    async uploadVideo(media: PostMedia, title: string, description?: string): Promise<string> {
        try {
            const token = await this.getValidAccessToken();

            // Step 1: Get video size from HEAD request (without downloading)
            console.log(`Checking video size from URL: ${media.url}`);
            const headResponse = await fetch(media.url, { method: "HEAD" });

            if (!headResponse.ok) {
                throw new Error(`Failed to access video URL: ${headResponse.status} ${headResponse.statusText}`);
            }

            const contentLength = headResponse.headers.get("Content-Length");
            if (!contentLength) {
                throw new Error("Video URL does not provide Content-Length header");
            }

            const videoSize = parseInt(contentLength, 10);
            console.log(`Video size: ${videoSize} bytes (${(videoSize / 1024 / 1024).toFixed(2)} MB)`);

            // Step 2: Initialize resumable upload session
            const initUrl = `${this.uploadUrl}/videos`;
            const params = new URLSearchParams({
                part: "snippet,status",
                uploadType: "resumable",
            });

            const metadata = {
                snippet: {
                    title,
                    description: description || "",
                    categoryId: "22", // People & Blogs
                    defaultLanguage: "vi",
                },
                status: {
                    privacyStatus: "public",
                    selfDeclaredMadeForKids: false,
                },
            };

            console.log("Initializing resumable upload session...");
            const initResponse = await fetch(`${initUrl}?${params.toString()}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json; charset=UTF-8",
                    "X-Upload-Content-Length": videoSize.toString(),
                    "X-Upload-Content-Type": "video/*",
                },
                body: JSON.stringify(metadata),
            });

            if (!initResponse.ok) {
                const errorText = await initResponse.text();
                throw new Error(`Failed to initialize upload: ${initResponse.status} - ${errorText}`);
            }

            // Step 3: Get the resumable session URI from Location header
            const uploadSessionUri = initResponse.headers.get("Location");
            if (!uploadSessionUri) {
                throw new Error("Failed to get upload session URI from Location header");
            }

            console.log(`Upload session initialized. Session URI obtained.`);

            // Step 4: Stream video directly from URL to YouTube
            const videoId = await this.uploadVideoStream(uploadSessionUri, media.url, videoSize);

            console.log(`Video uploaded successfully. Video ID: ${videoId}`);
            return videoId;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            console.error("YouTube upload error:", errorMessage);
            throw new Error(`Failed to upload video to YouTube: ${errorMessage}`);
        }
    }

    /**
     * Stream video directly from URL to YouTube without buffering entire file
     */
    private async uploadVideoStream(
        sessionUri: string,
        videoUrl: string,
        videoSize: number,
        maxRetries = 3
    ): Promise<string> {
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                console.log(`Upload attempt ${attempt + 1}/${maxRetries}...`);

                // Fetch video and stream it directly
                const videoResponse = await fetch(videoUrl);

                if (!videoResponse.ok) {
                    throw new Error(`Failed to fetch video: ${videoResponse.status}`);
                }

                if (!videoResponse.body) {
                    throw new Error("Video response has no body stream");
                }

                // Upload with streaming body
                const uploadResponse = await fetch(sessionUri, {
                    method: "PUT",
                    headers: {
                        "Content-Length": videoSize.toString(),
                        "Content-Type": "video/*",
                    },
                    body: videoResponse.body, // Stream the body directly
                    // @ts-ignore - duplex is needed for streaming in Node.js fetch
                    duplex: "half",
                });

                // HTTP 200 or 201 - Upload successful
                if (uploadResponse.status === 200 || uploadResponse.status === 201) {
                    const data: YouTubeVideoUploadResponse = await uploadResponse.json();
                    if (!data.id) {
                        throw new Error("Upload completed but no video ID in response");
                    }
                    console.log(`Upload successful! Video ID: ${data.id}, Status: ${data.status?.uploadStatus}`);
                    return data.id;
                }

                // HTTP 308 - Resume incomplete
                if (uploadResponse.status === 308) {
                    console.log("Upload incomplete (308). Retrying...");
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    continue;
                }

                // HTTP 5xx - Server error
                if (uploadResponse.status >= 500) {
                    const waitTime = Math.min(1000 * Math.pow(2, attempt), 16000);
                    console.warn(`Server error ${uploadResponse.status}. Retrying in ${waitTime}ms...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    continue;
                }

                // HTTP 4xx - Client error (permanent failure)
                if (uploadResponse.status >= 400 && uploadResponse.status < 500) {
                    const errorText = await uploadResponse.text();
                    throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
                }

                // Unexpected status
                const errorText = await uploadResponse.text();
                throw new Error(`Unexpected response ${uploadResponse.status}: ${errorText}`);

            } catch (error) {
                if (attempt === maxRetries - 1) {
                    throw error; // Max retries exceeded
                }

                // Retry network errors
                if (error instanceof TypeError) {
                    const waitTime = Math.min(1000 * Math.pow(2, attempt), 16000);
                    console.warn(`Network error. Retrying in ${waitTime}ms...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    continue;
                }

                throw error; // Non-retryable error
            }
        }

        throw new Error("Upload failed after maximum retries");
    }


    /**
     * Get video processing status
     */
    async getVideoStatus(videoId: string): Promise<"processing" | "ready" | "failed"> {
        try {
            const token = await this.getValidAccessToken(); // Lấy token hợp lệ

            const url = `${this.baseUrl}/videos`;
            const params = new URLSearchParams({
                part: "status,processingDetails",
                id: videoId,
            });

            const response = await fetch(`${url}?${params.toString()}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data: YouTubeVideoResponse = await response.json();

            if (!data.items || data.items.length === 0) {
                return "failed";
            }

            const status = data.items[0].status.uploadStatus;

            switch (status) {
                case "processed":
                    return "ready";
                case "uploaded":
                    return "processing";
                case "failed":
                    return "failed";
                default:
                    return "processing";
            }
        } catch (error) {
            return "failed";
        }
    }

    /**
     * Add video to playlist
     */
    async addToPlaylist(videoId: string, playlistId: string): Promise<boolean> {
        try {
            const token = await this.getValidAccessToken(); // Lấy token hợp lệ

            const url = `${this.baseUrl}/playlistItems`;
            const params = new URLSearchParams({
                part: "snippet",
            });

            const response = await fetch(`${url}?${params.toString()}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    snippet: {
                        playlistId,
                        resourceId: {
                            kind: "youtube#video",
                            videoId,
                        },
                    },
                }),
            });

            const data = await response.json();
            return !data.error;
        } catch (error) {
            console.error("Failed to add video to playlist:", error);
            return false;
        }
    }

    /**
     * Wait for video processing to complete
     */
    private async waitForProcessing(videoId: string, maxAttempts = 60): Promise<"processing" | "ready" | "failed"> {
        for (let i = 0; i < maxAttempts; i++) {
            const status = await this.getVideoStatus(videoId);

            if (status === "ready" || status === "failed") {
                return status;
            }

            // Wait 5 seconds before next check (YouTube processing can take longer)
            await new Promise((resolve) => setTimeout(resolve, 5000));
        }

        return "failed";
    }

    /**
     * Refresh access token
     */
    private async refreshAccessToken(): Promise<{ accessToken: string; expiresIn: number }> {
        const url = "https://oauth2.googleapis.com/token";
        const params = new URLSearchParams({
            client_id: this.config.clientId,
            client_secret: this.config.clientSecret,
            refresh_token: this.config.refreshToken,
            grant_type: "refresh_token",
        });

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: params,
            });

            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error_description || errorData.error || errorMessage;
                } catch (e) {
                    // Ignore JSON parse error
                }
                throw new Error(`YouTube API error: ${errorMessage}`);
            }

            const data = await response.json();

            if (!data.access_token || !data.expires_in) {
                throw new Error("Invalid token response: missing access_token or expires_in");
            }

            return {
                accessToken: data.access_token,
                expiresIn: data.expires_in, // seconds
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            console.error("Failed to refresh YouTube token:", errorMessage);
            throw new Error(`Failed to refresh YouTube token: ${errorMessage}`);
        }
    }

    /**
     * Format description with body and hashtags
     */
    private formatDescription(request: PlatformPublishRequest): string {
        let description = request.body || "";

        if (request.hashtags.length > 0) {
            description += "\n\n" + request.hashtags.map((tag) => `#${tag}`).join(" ");
        }

        return description;
    }
}

/**
 * Factory function to create YouTubeIntegration with user's refresh token
 * This retrieves the token from SocialAuth repository for the given user
 */
export async function createYouTubeIntegrationForUser(userId: string, channelId?: string): Promise<YouTubeIntegration> {
    const { SocialAuthRepository } = await import("@/infrastructure/repositories/social-auth-repo");
    const { ObjectId } = await import("mongodb");

    const repo = new SocialAuthRepository();
    const auth = await repo.getByUserAndPlatform(new ObjectId(userId), "youtube");

    if (!auth) {
        throw new Error("YouTube account not connected for this user");
    }

    // Check if token is expired
    if (new Date() >= auth.expiresAt) {
        throw new Error("YouTube token has expired. Please reconnect your account.");
    }

    const config: YouTubeConfig = {
        apiKey: process.env.YOUTUBE_API_KEY || "",
        clientId: process.env.YOUTUBE_CLIENT_ID || "",
        clientSecret: process.env.YOUTUBE_CLIENT_SECRET || "",
        refreshToken: auth.refreshToken
    };

    if (!config.clientId || !config.clientSecret) {
        throw new Error("Missing YouTube client configuration. Please set YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET environment variables.");
    }

    const integration = new YouTubeIntegration(config);
    await integration.initialize();

    return integration;
}

/**
 * Factory function to create YouTubeIntegration with provided refresh token
 * Used by workers and internal services
 */
export async function createYouTubeIntegration(refreshToken: string): Promise<YouTubeIntegration> {
    const config: YouTubeConfig = {
        apiKey: process.env.YOUTUBE_API_KEY || "",
        clientId: process.env.YOUTUBE_CLIENT_ID || "",
        clientSecret: process.env.YOUTUBE_CLIENT_SECRET || "",
        refreshToken,
    };

    if (!config.clientId || !config.clientSecret || !config.refreshToken) {
        throw new Error("Missing YouTube configuration");
    }

    const integration = new YouTubeIntegration(config);
    await integration.initialize();

    return integration;
}

/**
 * Refresh YouTube OAuth token
 * Returns a new access token (refresh tokens don't expire in YouTube)
 */
export async function refreshYouTubeToken(refreshToken: string): Promise<{
    access_token: string;
    expires_in: number;
    scope: string;
} | null> {
    try {
        const clientId = process.env.YOUTUBE_CLIENT_ID;
        const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            throw new Error("Missing YouTube client configuration");
        }

        const params = new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: "refresh_token",
        });

        const response = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params,
        });

        const data = await response.json();

        if (!response.ok || data.error) {
            console.error("Failed to refresh YouTube token:", data.error);
            return null;
        }

        return {
            access_token: data.access_token,
            expires_in: data.expires_in || 3600, // 1 hour default
            scope: data.scope || "",
        };
    } catch (error) {
        console.error("Error refreshing YouTube token:", error);
        return null;
    }
}