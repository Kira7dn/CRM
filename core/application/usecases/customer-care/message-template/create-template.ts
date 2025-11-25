import type {
  MessageTemplate,
  validateMessageTemplate,
  parseTemplateVariables,
} from "@/core/domain/customers/message-template";
import type {
  MessageTemplateService,
  MessageTemplatePayload,
} from "@/core/application/interfaces/customer-care/message-template-service";

export interface CreateTemplateRequest extends MessageTemplatePayload { }

export interface CreateTemplateResponse {
  template: MessageTemplate;
}

export class CreateTemplateUseCase {
  constructor(private templateService: MessageTemplateService) { }

  async execute(
    request: CreateTemplateRequest
  ): Promise<CreateTemplateResponse> {
    // Import validation function
    const { validateMessageTemplate, parseTemplateVariables } = await import(
      "@/core/domain/customers/message-template"
    );

    // Validate template
    const errors = validateMessageTemplate(request);
    if (errors.length > 0) {
      throw new Error(`Template validation failed: ${errors.join(", ")}`);
    }

    // Auto-parse variables if not provided
    if (!request.variables || request.variables.length === 0) {
      const parsedVars = parseTemplateVariables(request.content || "");
      // Create basic variable definitions
      request.variables = parsedVars.map((name) => ({
        name,
        type: "text",
        required: true,
      }));
    }

    // Set defaults
    const now = new Date();
    const payload: MessageTemplatePayload = {
      ...request,
      isActive: request.isActive ?? true,
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    const template = await this.templateService.create(payload);
    return { template };
  }
}
