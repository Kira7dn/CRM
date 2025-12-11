import { PublishWordPressPostUseCase } from "@/core/application/usecases/social/wordpress/publish-wordpress-post";
import { SocialAuthRepository } from "@/infrastructure/repositories/social/social-auth-repo";

/**
 * Dependencies for WordPress Publish API
 */

const createSocialAuthRepository = async () => {
  return new SocialAuthRepository();
};

export const publishWordPressPostUseCase = async () => {
  const socialAuthService = await createSocialAuthRepository();
  return new PublishWordPressPostUseCase(socialAuthService);
};
