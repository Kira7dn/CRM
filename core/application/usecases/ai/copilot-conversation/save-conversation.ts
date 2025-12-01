import type {
  CopilotConversationService,
  CopilotConversationPayload,
} from "@/core/application/interfaces/ai/copilot-conversation-service";
import type { CopilotConversation } from "@/core/domain/ai/copilot-conversation";
import { validateCopilotConversation } from "@/core/domain/ai/copilot-conversation";

export interface SaveConversationRequest extends CopilotConversationPayload {}

export interface SaveConversationResponse {
  conversation: CopilotConversation;
}

export class SaveConversationUseCase {
  constructor(private conversationService: CopilotConversationService) {}

  async execute(request: SaveConversationRequest): Promise<SaveConversationResponse> {
    // Validate
    const errors = validateCopilotConversation(request);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(", ")}`);
    }

    const conversation = await this.conversationService.saveConversation(request);
    return { conversation };
  }
}
