import type { PostMetrics } from "@/core/domain/marketing/post";
import type { TikTokAuthService } from "../auth/tiktok-auth-service";
import { BasePostingAdapter } from "./posting-service";
import type { PostingPublishRequest, PostingPublishResponse } from "@/core/application/interfaces/social/posting-adapter";

export class TikTokPostingAdapter extends BasePostingAdapter {
  platform = "tiktok" as const;

  constructor(private auth: TikTokAuthService) {
    super();
  }

  async verifyAuth(): Promise<boolean> {
    return await this.auth.verifyAuth();
  }

  async publish(request: PostingPublishRequest): Promise<PostingPublishResponse> {
    // TODO: Implement TikTok posting
    return {
      success: false,
      error: "TikTok posting not yet implemented",
    };
  }

  async update(postId: string, request: PostingPublishRequest): Promise<PostingPublishResponse> {
    // TODO: Implement TikTok update
    return {
      success: false,
      error: "TikTok update not yet implemented",
    };
  }

  async delete(postId: string): Promise<boolean> {
    // TODO: Implement TikTok delete
    return false;
  }

  async getMetrics(postId: string): Promise<PostMetrics> {
    // TODO: Implement TikTok metrics
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
