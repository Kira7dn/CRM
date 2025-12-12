import type { SocialPlatform } from "@/core/domain/social/social-auth";
import type { OAuthAdapterResolver } from "@/core/application/interfaces/social/oauth-adapter-resolver";

export interface GetAuthorizationUrlRequest {
    platform: SocialPlatform;
    userId?: string; // optional but FE thường gửi vào để gắn state
    state?: string;  // FE có thể tự truyền hoặc không
}

export interface GetAuthorizationUrlResponse {
    authorizationUrl: string;
}

export class GetAuthorizationUrlUseCase {
    constructor(
        private readonly adapterResolver: OAuthAdapterResolver
    ) { }

    async execute(
        request: GetAuthorizationUrlRequest
    ): Promise<GetAuthorizationUrlResponse> {
        const { platform, state } = request;

        // 1. Resolve đúng adapter cho platform
        const adapter = await this.adapterResolver.getAdapter(platform);

        // 2. Tạo mã state để bảo mật chống CSRF
        const generatedState =
            state ||
            Buffer.from(
                JSON.stringify({
                    platform,
                    ts: Date.now(),
                })
            ).toString("base64");

        // 3. Lấy Authorization URL
        const url = adapter.getAuthorizationUrl(generatedState);

        return { authorizationUrl: url };
    }
}
