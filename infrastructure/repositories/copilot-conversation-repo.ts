import { ObjectId } from "mongodb";
import type { CopilotConversation, CopilotMessage } from "@/core/domain/copilot-conversation";
import type { CopilotConversationService, CopilotConversationPayload } from "@/core/application/interfaces/copilot-conversation-service";
import { BaseRepository } from "@/infrastructure/db/base-repository";
import { generateConversationTitle } from "@/core/domain/copilot-conversation";

/**
 * CopilotKit Conversation Repository
 * Handles persistence of CopilotKit conversations to MongoDB
 */
export class CopilotConversationRepository
  extends BaseRepository<CopilotConversation, string>
  implements CopilotConversationService
{
  protected collectionName = "copilot_conversations";

  /**
   * Convert MongoDB ObjectId to string
   */
  protected convertId(value: ObjectId | string): string {
    if (typeof value === "string") return value;
    return value.toString();
  }

  /**
   * Save conversation (create or update)
   */
  async saveConversation(payload: CopilotConversationPayload): Promise<CopilotConversation> {
    const collection = await this.getCollection();
    const now = new Date();

    // Generate title from first user message if not provided
    const title =
      payload.title ||
      (payload.messages && payload.messages.length > 0
        ? generateConversationTitle(
            payload.messages.find((m) => m.role === "user")?.content || "New Conversation"
          )
        : "New Conversation");

    const conversation: CopilotConversation = {
      id: payload.id || new ObjectId().toString(),
      userId: payload.userId!,
      title,
      messages: payload.messages || [],
      status: payload.status || "active",
      createdAt: payload.createdAt || now,
      updatedAt: now,
    };

    const docId = new ObjectId(conversation.id);

    await collection.updateOne(
      { _id: docId },
      {
        $set: {
          userId: conversation.userId,
          title: conversation.title,
          messages: conversation.messages,
          status: conversation.status,
          updatedAt: conversation.updatedAt,
        },
        $setOnInsert: {
          createdAt: conversation.createdAt,
        },
      },
      { upsert: true }
    );

    return conversation;
  }

  /**
   * Get conversation by ID
   */
  async getConversation(conversationId: string): Promise<CopilotConversation | null> {
    const collection = await this.getCollection();

    try {
      const doc = await collection.findOne({ _id: new ObjectId(conversationId) });

      if (!doc) return null;

      return {
        id: conversationId,
        userId: doc.userId,
        title: doc.title,
        messages: doc.messages || [],
        status: doc.status || "active",
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      };
    } catch (error) {
      console.error("Error getting conversation:", error);
      return null;
    }
  }

  /**
   * Get user's conversations (sorted by most recent)
   */
  async getUserConversations(userId: string, limit: number = 50): Promise<CopilotConversation[]> {
    const collection = await this.getCollection();

    const docs = await collection
      .find({ userId, status: "active" })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .toArray();

    return docs.map((doc) => ({
      id: doc._id.toString(),
      userId: doc.userId,
      title: doc.title || "Untitled Conversation",
      messages: doc.messages || [],
      status: doc.status || "active",
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
  }

  /**
   * Add messages to existing conversation
   */
  async addMessages(
    conversationId: string,
    messages: CopilotMessage[]
  ): Promise<CopilotConversation | null> {
    const collection = await this.getCollection();

    try {
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(conversationId) },
        {
          $push: { messages: { $each: messages } } as any,
          $set: { updatedAt: new Date() },
        },
        { returnDocument: "after" }
      );

      if (!result) return null;

      return {
        id: conversationId,
        userId: result.userId,
        title: result.title,
        messages: result.messages || [],
        status: result.status,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      };
    } catch (error) {
      console.error("Error adding messages:", error);
      return null;
    }
  }

  /**
   * Archive conversation
   */
  async archiveConversation(conversationId: string): Promise<boolean> {
    const collection = await this.getCollection();

    try {
      const result = await collection.updateOne(
        { _id: new ObjectId(conversationId) },
        {
          $set: {
            status: "archived",
            updatedAt: new Date(),
          },
        }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      console.error("Error archiving conversation:", error);
      return false;
    }
  }

  /**
   * Delete conversation
   */
  async deleteConversation(conversationId: string): Promise<boolean> {
    const collection = await this.getCollection();

    try {
      const result = await collection.deleteOne({ _id: new ObjectId(conversationId) });
      return result.deletedCount > 0;
    } catch (error) {
      console.error("Error deleting conversation:", error);
      return false;
    }
  }
}
