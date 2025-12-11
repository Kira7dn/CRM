import { GetWordPressAuthorizationUrlUseCase } from "@/core/application/usecases/social/wordpress/get-wordpress-authorization-url";

/**
 * Dependencies for WordPress Authorization API
 */

export const getWordPressAuthorizationUrlUseCase = async () => {
  return new GetWordPressAuthorizationUrlUseCase();
};
