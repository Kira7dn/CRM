import { ExchangeWordPressTokenUseCase } from "@/core/application/usecases/social/wordpress/exchange-wordpress-token";
import { SocialAuthRepository } from "@/infrastructure/repositories/social/social-auth-repo";

/**
 * Dependencies for WordPress Callback API
 */

const createSocialAuthRepository = async () => {
  return new SocialAuthRepository();
};

export const exchangeWordPressTokenUseCase = async () => {
  const socialAuthService = await createSocialAuthRepository();
  return new ExchangeWordPressTokenUseCase(socialAuthService);
};
