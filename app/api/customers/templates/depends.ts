import { MessageTemplateRepository } from "@/infrastructure/repositories/customers/message-template-repo";
import type { MessageTemplateService } from "@/core/application/interfaces/customers/message-template-service";

// Use cases
import { CreateTemplateUseCase } from "@/core/application/usecases/customers/care/customer-care/message-template/create-template";
import { GetTemplatesUseCase } from "@/core/application/usecases/customers/care/customer-care/message-template/get-templates";
import { UpdateTemplateUseCase } from "@/core/application/usecases/customers/care/customer-care/message-template/update-template";
import { RenderTemplateUseCase } from "@/core/application/usecases/customers/care/customer-care/message-template/render-template";

/**
 * Factory function to create MessageTemplateRepository
 */
const createTemplateRepository = async (): Promise<MessageTemplateService> => {
  return new MessageTemplateRepository();
};

/**
 * Factory function to create CreateTemplateUseCase
 */
export const createTemplateUseCase = async () => {
  const service = await createTemplateRepository();
  return new CreateTemplateUseCase(service);
};

/**
 * Factory function to create GetTemplatesUseCase
 */
export const getTemplatesUseCase = async () => {
  const service = await createTemplateRepository();
  return new GetTemplatesUseCase(service);
};

/**
 * Factory function to create UpdateTemplateUseCase
 */
export const updateTemplateUseCase = async () => {
  const service = await createTemplateRepository();
  return new UpdateTemplateUseCase(service);
};

/**
 * Factory function to create RenderTemplateUseCase
 */
export const renderTemplateUseCase = async () => {
  const service = await createTemplateRepository();
  return new RenderTemplateUseCase(service);
};
