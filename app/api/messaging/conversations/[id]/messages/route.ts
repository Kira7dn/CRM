import { NextRequest, NextResponse } from "next/server";
import { createMessageRepository } from "../../../depends";

/**
 * GET /api/messaging/conversations/[id]/messages
 * Fetch all messages for a specific conversation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400 }
      );
    }

    const messageService = await createMessageRepository();

    // Fetch messages for the conversation
    const messages = await messageService.getByConversationId(conversationId);

    // Sort by sentAt (oldest first for chronological display)
    messages.sort((a, b) => {
      const timeA = new Date(a.sentAt).getTime();
      const timeB = new Date(b.sentAt).getTime();
      return timeA - timeB;
    });

    return NextResponse.json({
      messages,
      total: messages.length,
    });
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
