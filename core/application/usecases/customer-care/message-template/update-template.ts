import type {
  MessageTemplate,
  validateMessageTemplate,
} from "@/core/domain/customers/message-template";
import type {
  MessageTemplateService,
  MessageTemplatePayload,
} from "@/core/application/interfaces/customer-care/message-template-service";

export interface UpdateTemplateRequest extends MessageTemplatePayload {
  id: string;
}

export interface UpdateTemplateResponse {
  template: MessageTemplate;
}

export class UpdateTemplateUseCase {
  constructor(private templateService: MessageTemplateService) { }

  async execute(
    request: UpdateTemplateRequest
  ): Promise<UpdateTemplateResponse> {
    // Check if template exists
    const existingTemplate = await this.templateService.getById(request.id);
    if (!existingTemplate) {
      throw new Error(`Template with ID ${request.id} not found`);
    }

    // Validate if content or variables are being updated
    if (request.content || request.variables) {
      const templateToValidate = {
        ...existingTemplate,
        ...request,
      };

      const { validateMessageTemplate } = await import(
        "@/core/domain/customers/message-template"
      );
      const errors = validateMessageTemplate(templateToValidate);
      if (errors.length > 0) {
        throw new Error(`Template validation failed: ${errors.join(", ")}`);
      }
    }

    const payload: MessageTemplatePayload = {
      ...request,
      updatedAt: new Date(),
    };

    const template = await this.templateService.update(payload);
    if (!template) {
      throw new Error(`Failed to update template with ID ${request.id}`);
    }

    return { template };
  }
}
