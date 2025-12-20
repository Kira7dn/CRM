import { PostingPublishRequest } from "@/core/application/interfaces/marketing/posting-adapter";
import { PostMetrics } from "@/core/domain/marketing/post";

export function formatMessage(request: PostingPublishRequest): string {
    const parts: string[] = [];

    if (request.title) parts.push(request.title);
    if (request.body) parts.push(request.body);

    if (request.hashtags?.length) {
        parts.push(
            request.hashtags
                .map((t) => (t.startsWith("#") ? t : `#${t}`))
                .join(" ")
        );
    }

    if (request.mentions?.length) {
        parts.push(
            request.mentions.map((m) => `@${m}`).join(" ")
        );
    }

    return parts.join("\n\n");
}

export const emptyMetrics = (): PostMetrics => ({
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    reach: 0,
    engagement: 0,
    lastSyncedAt: new Date(),
});

export const sleep = (ms: number) =>
    new Promise((r) => setTimeout(r, ms));
