import type {
  MessageTemplate,
  renderTemplate,
} from "@/core/domain/customers/message-template";
import type { MessageTemplateService } from "@/core/application/interfaces/customer-care/message-template-service";

export interface RenderTemplateRequest {
  templateId: string;
  data: Record<string, any>;
  incrementUsage?: boolean; // Track usage statistics
}

export interface RenderTemplateResponse {
  renderedContent: string;
  errors: string[];
  template: MessageTemplate;
}

export class RenderTemplateUseCase {
  constructor(private templateService: MessageTemplateService) { }

  async execute(
    request: RenderTemplateRequest
  ): Promise<RenderTemplateResponse> {
    const template = await this.templateService.getById(request.templateId);
    if (!template) {
      throw new Error(`Template with ID ${request.templateId} not found`);
    }

    if (!template.isActive) {
      throw new Error(`Template ${template.name} is not active`);
    }

    // Render template with provided data
    const { renderTemplate } = await import(
      "@/core/domain/customers/message-template"
    );
    const { content, errors } = renderTemplate(template, request.data);

    // Increment usage count if requested
    if (request.incrementUsage && errors.length === 0) {
      await this.templateService.incrementUsage(request.templateId);
    }

    return {
      renderedContent: content,
      errors,
      template,
    };
  }
}
