import type { CopilotConversationService } from "@/core/application/interfaces/ai/copilot-conversation-service";
import type { CopilotConversation } from "@/core/domain/ai/copilot-conversation";

export interface GetUserConversationsRequest {
  userId: string;
  limit?: number;
}

export interface GetUserConversationsResponse {
  conversations: CopilotConversation[];
}

export class GetUserConversationsUseCase {
  constructor(private conversationService: CopilotConversationService) {}

  async execute(request: GetUserConversationsRequest): Promise<GetUserConversationsResponse> {
    if (!request.userId) {
      throw new Error("User ID is required");
    }

    const conversations = await this.conversationService.getUserConversations(
      request.userId,
      request.limit || 50
    );

    return { conversations };
  }
}
