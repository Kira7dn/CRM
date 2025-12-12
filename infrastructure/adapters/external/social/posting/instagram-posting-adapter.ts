import type { PostMetrics, PostMedia } from "@/core/domain/marketing/post";
import type { InstagramAuthService } from "../auth/instagram-auth-service";
import { BasePostingAdapter } from "./base-posting-service";
import type { PostingPublishRequest, PostingPublishResponse } from "@/core/application/interfaces/marketing/posting-adapter";

interface InstagramContainerResponse {
  id: string;
  error?: {
    message: string;
    type: string;
    code: number;
  };
}

interface InstagramPublishResponse {
  id: string;
  error?: {
    message: string;
    type: string;
    code: number;
  };
}

interface InstagramMediaStatusResponse {
  status_code: string;
  error?: {
    message: string;
  };
}

interface InstagramInsightsResponse {
  data: Array<{
    name: string;
    values: Array<{
      value: number;
    }>;
  }>;
}

/**
 * Instagram Posting Adapter
 * Handles publishing content to Instagram Business Accounts via Facebook Graph API
 *
 * Note: Instagram requires a 2-step publishing process:
 * 1. Create media container
 * 2. Publish the container
 *
 * For videos, step 2 requires polling until the video is processed
 */
export class InstagramPostingAdapter extends BasePostingAdapter {
  platform = "instagram" as const;
  private baseUrl = "https://graph.facebook.com/v19.0";

  constructor(private auth: InstagramAuthService) {
    super();
  }

  /**
   * Get valid access token
   */
  private getAccessToken(): string {
    return this.auth.getAccessToken();
  }

  /**
   * Get Instagram Business Account ID
   */
  private getIGAccountId(): string {
    return this.auth.getPageId();
  }

  async publish(request: PostingPublishRequest): Promise<PostingPublishResponse> {
    try {
      // Instagram requires at least one media item
      if (request.media.length === 0) {
        return {
          success: false,
          error: "Instagram requires at least one image or video",
        };
      }

      const caption = this.formatMessage(request);

      // Determine media type and publish accordingly
      if (request.media.length === 1) {
        const mediaType = request.media[0].type;
        if (mediaType === "image") {
          return await this.publishSingleImage(caption, request.media[0].url);
        } else if (mediaType === "video") {
          return await this.publishSingleVideo(caption, request.media[0].url);
        }
      } else {
        // Multiple media = carousel
        return await this.publishCarousel(caption, request.media);
      }

      return {
        success: false,
        error: "Unsupported media configuration",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async update(postId: string, request: PostingPublishRequest): Promise<PostingPublishResponse> {
    // Instagram does not support editing posts
    return {
      success: false,
      error: "Instagram does not support post editing. Please delete and create a new post.",
    };
  }

  async verifyAuth(): Promise<boolean> {
    return await this.auth.verifyAuth();
  }

  async delete(postId: string): Promise<boolean> {
    try {
      console.log(`[InstagramPostingAdapter] Delete requested for Instagram post:`, { postId });

      // Instagram Graph API does NOT support deleting media objects/posts
      // This is a known limitation of the Instagram API
      console.warn(`[InstagramPostingAdapter] Instagram API does not support deleting posts. Post will remain on Instagram.`);

      return false; // Always return false since delete is not supported
    } catch (error) {
      console.error(`[InstagramPostingAdapter] Delete error:`, error);
      this.logError("Failed to delete Instagram post", error);
      return false;
    }
  }

  async getMetrics(postId: string): Promise<PostMetrics> {
    try {
      const url = `${this.baseUrl}/${postId}`;
      const params = new URLSearchParams({
        fields: "like_count,comments_count,insights.metric(impressions,reach,engagement)",
        access_token: this.getAccessToken(),
      });

      const response = await fetch(`${url}?${params.toString()}`);
      const data = await response.json();

      const metrics: PostMetrics = {
        likes: data.like_count || 0,
        comments: data.comments_count || 0,
        shares: 0, // Instagram doesn't expose share count via API
        views: 0,
        reach: 0,
        engagement: 0,
        lastSyncedAt: new Date(),
      };

      // Parse insights if available
      if (data.insights?.data) {
        data.insights.data.forEach((metric: any) => {
          const value = metric.values[0]?.value || 0;
          switch (metric.name) {
            case "impressions":
              metrics.views = value;
              break;
            case "reach":
              metrics.reach = value;
              break;
            case "engagement":
              metrics.engagement = value;
              break;
          }
        });
      }

      return metrics;
    } catch (error) {
      this.logError("Failed to get Instagram metrics", error);
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
   * Publish single image post
   * Step 1: Create container
   * Step 2: Wait for image processing to complete
   * Step 3: Publish container
   */
  private async publishSingleImage(caption: string, imageUrl: string): Promise<PostingPublishResponse> {
    try {
      // Step 1: Create media container
      console.log(`[InstagramPostingAdapter] Starting single image publish process`);
      const containerId = await this.createImageContainer(imageUrl, caption);

      // Step 2: Wait for image processing to complete
      console.log(`[InstagramPostingAdapter] Waiting for image processing before publish`);
      const isReady = await this.waitForImageProcessing(containerId);

      if (!isReady) {
        return {
          success: false,
          error: "Image processing timeout or failed - media not ready for publishing",
        };
      }

      // Step 3: Publish container
      console.log(`[InstagramPostingAdapter] Image ready, publishing container`);
      return await this.publishContainer(containerId);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Publish single video post
   * Step 1: Create container
   * Step 2: Poll for video processing status
   * Step 3: Publish when ready
   */
  private async publishSingleVideo(caption: string, videoUrl: string): Promise<PostingPublishResponse> {
    try {
      // Step 1: Create video container
      const containerId = await this.createVideoContainer(videoUrl, caption);

      // Step 2: Wait for video processing
      const isReady = await this.waitForVideoProcessing(containerId);

      if (!isReady) {
        return {
          success: false,
          error: "Video processing timeout or failed",
        };
      }

      // Step 3: Publish container
      return await this.publishContainer(containerId);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Publish carousel (multiple images)
   * Step 1: Create child containers for each image
   * Step 2: Create carousel container with children
   * Step 3: Publish carousel
   */
  private async publishCarousel(caption: string, media: PostMedia[]): Promise<PostingPublishResponse> {
    try {
      // Filter only images for carousel
      const images = media.filter((m) => m.type === "image");

      if (images.length < 2 || images.length > 10) {
        return {
          success: false,
          error: "Carousel must have 2-10 images",
        };
      }

      // Step 1: Create child containers
      const childIds: string[] = [];
      for (const image of images) {
        const containerId = await this.createImageContainer(image.url, "", true);
        childIds.push(containerId);
      }

      // Step 2: Create carousel container
      const carouselId = await this.createCarouselContainer(childIds, caption);

      // Step 3: Publish carousel
      return await this.publishContainer(carouselId);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Create image media container
   */
  private async createImageContainer(imageUrl: string, caption: string, isChild: boolean = false): Promise<string> {
    const url = `${this.baseUrl}/${this.getIGAccountId()}/media`;
    const params: Record<string, string> = {
      image_url: imageUrl,
      access_token: this.getAccessToken(),
    };

    if (!isChild && caption) {
      params.caption = caption;
    }

    if (isChild) {
      params.is_carousel_item = "true";
    }

    console.log(`[InstagramPostingAdapter] Creating image container:`, {
      url,
      params: {
        ...params,
        access_token: params.access_token ? '[REDACTED]' : undefined
      },
      imageUrl,
      caption: caption || undefined,
      isChild
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(params),
    });

    const data: InstagramContainerResponse = await response.json();

    console.log(`[InstagramPostingAdapter] Container creation response:`, {
      status: response.status,
      ok: response.ok,
      data
    });

    if (data.error) {
      console.error(`[InstagramPostingAdapter] Container creation failed:`, data.error);
      throw new Error(data.error.message);
    }

    if (!data.id) {
      console.error(`[InstagramPostingAdapter] Container response missing ID:`, data);
      throw new Error("Media ID is not available - no container ID returned from Instagram API");
    }

    console.log(`[InstagramPostingAdapter] Container created successfully with ID:`, data.id);
    return data.id;
  }

  /**
   * Create video media container
   */
  private async createVideoContainer(videoUrl: string, caption: string): Promise<string> {
    const url = `${this.baseUrl}/${this.getIGAccountId()}/media`;
    const params: Record<string, string> = {
      media_type: "VIDEO",
      video_url: videoUrl,
      access_token: this.getAccessToken(),
    };

    if (caption) {
      params.caption = caption;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(params),
    });

    const data: InstagramContainerResponse = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.id;
  }

  /**
   * Create carousel container with child media
   */
  private async createCarouselContainer(childIds: string[], caption: string): Promise<string> {
    const url = `${this.baseUrl}/${this.getIGAccountId()}/media`;
    const params: Record<string, string> = {
      media_type: "CAROUSEL",
      children: childIds.join(","),
      access_token: this.getAccessToken(),
    };

    if (caption) {
      params.caption = caption;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(params),
    });

    const data: InstagramContainerResponse = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.id;
  }

  /**
   * Check video processing status
   */
  private async checkVideoStatus(containerId: string): Promise<string> {
    try {
      const url = `${this.baseUrl}/${containerId}`;
      const params = new URLSearchParams({
        fields: "status_code",
        access_token: this.getAccessToken(),
      });

      const response = await fetch(`${url}?${params.toString()}`);
      const data: InstagramMediaStatusResponse = await response.json();

      return data.status_code || "UNKNOWN";
    } catch (error) {
      this.logError("Failed to check video status", error);
      return "ERROR";
    }
  }

  /**
   * Wait for video processing to complete
   * Poll status until ready or timeout
   */
  private async waitForVideoProcessing(containerId: string, maxAttempts: number = 30): Promise<boolean> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const status = await this.checkVideoStatus(containerId);

      if (status === "FINISHED") {
        return true;
      }

      if (status === "ERROR") {
        this.logError("Video processing failed", new Error("Container status: ERROR"));
        return false;
      }

      // Wait 2 seconds before next check
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    this.logError("Video processing timeout", new Error(`Timeout after ${maxAttempts} attempts`));
    return false;
  }

  /**
   * Check image processing status
   */
  private async checkImageStatus(containerId: string): Promise<string> {
    try {
      const url = `${this.baseUrl}/${containerId}`;
      const params = new URLSearchParams({
        fields: "status_code",
        access_token: this.getAccessToken(),
      });

      const response = await fetch(`${url}?${params.toString()}`);
      const data: InstagramMediaStatusResponse = await response.json();

      console.log(`[InstagramPostingAdapter] Image status check:`, {
        containerId,
        status: data.status_code,
        response: data
      });

      return data.status_code || "UNKNOWN";
    } catch (error) {
      this.logError("Failed to check image status", error);
      return "ERROR";
    }
  }

  /**
   * Wait for image processing to complete
   * Poll status until ready or timeout
   */
  private async waitForImageProcessing(containerId: string, maxAttempts: number = 10): Promise<boolean> {
    console.log(`[InstagramPostingAdapter] Waiting for image processing:`, { containerId, maxAttempts });

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const status = await this.checkImageStatus(containerId);
      console.log(`[InstagramPostingAdapter] Image processing attempt ${attempt + 1}/${maxAttempts}: status = ${status}`);

      if (status === "FINISHED") {
        console.log(`[InstagramPostingAdapter] Image processing completed successfully`);
        return true;
      }

      if (status === "ERROR") {
        this.logError("Image processing failed", new Error("Container status: ERROR"));
        return false;
      }

      if (status === "IN_PROGRESS" || status === "PENDING") {
        // Wait 2 seconds before next check
        await new Promise((resolve) => setTimeout(resolve, 2000));
        continue;
      }

      // For unknown status, wait and retry
      if (status === "UNKNOWN") {
        console.log(`[InstagramPostingAdapter] Unknown status, waiting and retrying...`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        continue;
      }
    }

    this.logError("Image processing timeout", new Error(`Timeout after ${maxAttempts} attempts`));
    return false;
  }

  /**
   * Publish media container
   */
  private async publishContainer(containerId: string): Promise<PostingPublishResponse> {
    try {
      console.log(`[InstagramPostingAdapter] Starting container publish:`, {
        containerId,
        igAccountId: this.getIGAccountId(),
        hasAccessToken: !!this.getAccessToken()
      });

      // Validate container ID
      if (!containerId || containerId.trim() === '') {
        console.error(`[InstagramPostingAdapter] Invalid container ID:`, containerId);
        return {
          success: false,
          error: "Media ID is not available - container creation may have failed",
        };
      }

      const url = `${this.baseUrl}/${this.getIGAccountId()}/media_publish`;
      const params = new URLSearchParams({
        creation_id: containerId,
        access_token: this.getAccessToken(),
      });

      console.log(`[InstagramPostingAdapter] Publishing container:`, {
        url,
        creation_id: containerId,
        hasToken: !!this.getAccessToken()
      });

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      });

      const data: InstagramPublishResponse = await response.json();

      console.log(`[InstagramPostingAdapter] Publish response:`, {
        status: response.status,
        ok: response.ok,
        data
      });

      if (data.error) {
        console.error(`[InstagramPostingAdapter] Publish failed:`, data.error);
        return {
          success: false,
          error: data.error.message,
        };
      }

      const permalink = `https://www.instagram.com/p/${await this.extractShortcode(data.id)}/`;
      console.log(`[InstagramPostingAdapter] Publish successful:`, {
        postId: data.id,
        permalink
      });

      return {
        success: true,
        postId: data.id,
        permalink,
      };
    } catch (error) {
      console.error(`[InstagramPostingAdapter] Publish error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Extract Instagram shortcode from media ID by fetching from Instagram API
   * Instagram media ID and permalink are different - we need to fetch the actual permalink
   */
  private async extractShortcode(mediaId: string): Promise<string> {
    try {
      const url = `${this.baseUrl}/${mediaId}`;
      const params = new URLSearchParams({
        fields: "permalink",
        access_token: this.getAccessToken(),
      });

      console.log(`[InstagramPostingAdapter] Fetching permalink for media ID:`, mediaId);

      const response = await fetch(`${url}?${params.toString()}`);
      const data = await response.json();

      console.log(`[InstagramPostingAdapter] Permalink fetch response:`, {
        status: response.status,
        ok: response.ok,
        data
      });

      if (data.error) {
        console.error(`[InstagramPostingAdapter] Failed to fetch permalink:`, data.error);
        // Fallback to media ID if API call fails
        return mediaId;
      }

      if (data.permalink) {
        // Extract shortcode from permalink URL
        // https://www.instagram.com/p/DSJnPMGklxP/ -> DSJnPMGklxP
        const shortcodeMatch = data.permalink.match(/instagram\.com\/p\/([^\/]+)/);
        if (shortcodeMatch && shortcodeMatch[1]) {
          console.log(`[InstagramPostingAdapter] Extracted shortcode:`, shortcodeMatch[1]);
          return shortcodeMatch[1];
        }
      }

      console.warn(`[InstagramPostingAdapter] Could not extract shortcode from permalink, falling back to media ID`);
      return mediaId;
    } catch (error) {
      console.error(`[InstagramPostingAdapter] Error fetching permalink:`, error);
      // Fallback to media ID if API call fails
      return mediaId;
    }
  }

  protected formatMessage(request: PostingPublishRequest): string {
    let message = super.formatMessage(request);

    // Instagram supports hashtags and mentions
    if (request.hashtags && request.hashtags.length > 0) {
      message += "\n\n" + request.hashtags.map((tag) => `#${tag}`).join(" ");
    }

    if (request.mentions && request.mentions.length > 0) {
      message += "\n" + request.mentions.map((mention) => `@${mention}`).join(" ");
    }

    return message;
  }
}
