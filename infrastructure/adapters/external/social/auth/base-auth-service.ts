import type { PlatformAuthService, PlatformAuthConfig } from "@/core/application/interfaces/social/auth-service";

/**
 * Base implementation for platform auth services
 */
export abstract class BasePlatformAuthService implements PlatformAuthService {
  protected baseUrl: string = "";

  constructor(protected config: PlatformAuthConfig) {}

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
