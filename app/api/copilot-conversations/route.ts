import { NextRequest, NextResponse } from "next/server";
import {
  saveConversationUseCase,
  getUserConversationsUseCase,
  getConversationUseCase,
} from "./depends";

/**
 * GET /api/copilot-conversations?userId={userId}
 * Get all conversations for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const conversationId = searchParams.get("conversationId");

    // Get specific conversation
    if (conversationId) {
      const useCase = await getConversationUseCase();
      const result = await useCase.execute({ conversationId });

      if (!result.conversation) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
      }

      return NextResponse.json(result.conversation);
    }

    // Get user conversations
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const useCase = await getUserConversationsUseCase();
    const result = await useCase.execute({ userId });

    return NextResponse.json(result.conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/copilot-conversations
 * Save a conversation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const useCase = await saveConversationUseCase();
    const result = await useCase.execute(body);

    return NextResponse.json(result.conversation);
  } catch (error) {
    console.error("Error saving conversation:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save conversation" },
      { status: 500 }
    );
  }
}
