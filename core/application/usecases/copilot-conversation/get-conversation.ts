import type { CopilotConversationService } from "@/core/application/interfaces/copilot-conversation-service";
import type { CopilotConversation } from "@/core/domain/copilot-conversation";

export interface GetConversationRequest {
  conversationId: string;
}

export interface GetConversationResponse {
  conversation: CopilotConversation | null;
}

export class GetConversationUseCase {
  constructor(private conversationService: CopilotConversationService) {}

  async execute(request: GetConversationRequest): Promise<GetConversationResponse> {
    if (!request.conversationId) {
      throw new Error("Conversation ID is required");
    }

    const conversation = await this.conversationService.getConversation(request.conversationId);
    return { conversation };
  }
}
