import { DetectWordPressTypeUseCase } from "@/core/application/usecases/social/wordpress/detect-wordpress-type";

/**
 * Dependencies for WordPress Detect API
 */

export const detectWordPressTypeUseCase = async () => {
  return new DetectWordPressTypeUseCase();
};
