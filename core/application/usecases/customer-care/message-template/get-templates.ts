import type { MessageTemplate } from "@/core/domain/customers/message-template";
import type {
  MessageTemplateService,
  MessageTemplateFilterOptions,
} from "@/core/application/interfaces/customer-care/message-template-service";

export interface GetTemplatesRequest {
  options?: MessageTemplateFilterOptions;
}

export interface GetTemplatesResponse {
  templates: MessageTemplate[];
  total: number;
}

export class GetTemplatesUseCase {
  constructor(private templateService: MessageTemplateService) { }

  async execute(request: GetTemplatesRequest): Promise<GetTemplatesResponse> {
    const templates = await this.templateService.getAll(request.options);

    return {
      templates,
      total: templates.length,
    };
  }
}
