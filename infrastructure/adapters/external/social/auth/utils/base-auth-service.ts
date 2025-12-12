import type { PlatformOAuthService, PlatformOAuthConfig } from "@/core/application/interfaces/social/platform-oauth-adapter";

/**
 * Base implementation for platform auth services
 */
export abstract class BasePlatformOAuthService implements PlatformOAuthService {
  protected baseUrl: string = "";

  constructor(protected config: PlatformOAuthConfig) { }

  getAccessToken(): string {
    return this.config.accessToken;
  }

  getPageId(): string {
    return this.config.pageId || "";
  }

  isExpired(): boolean {
    if (!this.config.expiresAt) return false;
    return new Date() >= this.config.expiresAt;
  }

  abstract verifyAuth(): Promise<boolean>;

  protected log(message: string, data?: any): void {
    const serviceName = this.constructor.name;
    console.log(`[${serviceName}] ${message}`, data || "");
  }

  protected logError(message: string, error: any): void {
    const serviceName = this.constructor.name;
    console.error(`[${serviceName}] ${message}`, {
      error: error.message,
      stack: error.stack,
    });
  }
}
