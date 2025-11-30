import type { PostMetrics } from "@/core/domain/marketing/post";
import type { ZaloAuthService } from "../auth/zalo-auth-service";
import { BasePostingAdapter } from "./posting-service";
import type { PostingPublishRequest, PostingPublishResponse } from "@/core/application/interfaces/social/posting-adapter";

export class ZaloPostingAdapter extends BasePostingAdapter {
  platform = "zalo" as const;

  constructor(private auth: ZaloAuthService) {
    super();
  }

  async verifyAuth(): Promise<boolean> {
    return await this.auth.verifyAuth();
  }

  async publish(request: PostingPublishRequest): Promise<PostingPublishResponse> {
    // TODO: Implement Zalo posting
    return {
      success: false,
      error: "Zalo posting not yet implemented",
    };
  }

  async update(postId: string, request: PostingPublishRequest): Promise<PostingPublishResponse> {
    // TODO: Implement Zalo update
    return {
      success: false,
      error: "Zalo update not yet implemented",
    };
  }

  async delete(postId: string): Promise<boolean> {
    // TODO: Implement Zalo delete
    return false;
  }

  async getMetrics(postId: string): Promise<PostMetrics> {
    // TODO: Implement Zalo metrics
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
