import { ObjectId } from "mongodb";
import type { ChatMessage, ChatConversation, MessageIntent } from "@/core/domain/chatbot/chat-message";
import { classifyIntent, generateMessageId, generateConversationId } from "@/core/domain/chatbot/chat-message";
import type { ChatbotService, ChatbotQueryRequest, ChatbotQueryResponse } from "@/core/application/interfaces/chatbot/chatbot-service";
import { BaseRepository } from "@/infrastructure/db/base-repository";
import { getLLMService } from "@/infrastructure/services/llm-service";

/**
 * Chatbot Repository implementation
 * Handles both rule-based and AI-powered chatbot responses
 */
export class ChatbotRepository extends BaseRepository<ChatConversation, string> implements ChatbotService {
  protected collectionName = "chat_conversations";

  /**
   * Convert MongoDB ObjectId to string
   */
  protected convertId(value: ObjectId | string): string {
    if (typeof value === "string") return value;
    return value.toString();
  }

  /**
   * Process chatbot query and generate response
   */
  async query(request: ChatbotQueryRequest): Promise<ChatbotQueryResponse> {
    // Classify user intent
    const { intent, confidence } = classifyIntent(request.message);

    // Get or create conversation
    let conversationId = request.conversationId;
    let conversation: ChatConversation | null = null;

    if (conversationId) {
      conversation = await this.getConversation(conversationId);
    }

    if (!conversation) {
      conversationId = generateConversationId();
      conversation = {
        id: conversationId,
        userId: request.userId,
        messages: [],
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    const finalConversationId = conversationId ?? conversation.id;

    // Create user message
    const userMessage: ChatMessage = {
      id: generateMessageId(),
      conversationId: finalConversationId,
      role: "user",
      content: request.message,
      intent,
      confidence,
      createdAt: new Date(),
    };

    // Generate assistant response
    let responseContent: string;
    let responseMetadata: Record<string, any> = {};

    if (request.useAI) {
      // AI-powered response using LLM
      responseContent = await this.generateAIResponse(request.message, intent, conversation.messages);
    } else {
      // Rule-based response
      const ruleResponse = await this.generateRuleBasedResponse(intent, request.message);
      responseContent = ruleResponse.content;
      responseMetadata = ruleResponse.metadata || {};
    }

    // Create assistant message
    const assistantMessage: ChatMessage = {
      id: generateMessageId(),
      conversationId: finalConversationId,
      role: "assistant",
      content: responseContent,
      intent,
      confidence,
      metadata: responseMetadata,
      createdAt: new Date(),
    };

    // Update conversation
    conversation.messages.push(userMessage, assistantMessage);
    conversation.updatedAt = new Date();

    // Save conversation to database
    await this.saveConversation(conversation);

    return {
      message: assistantMessage,
      intent,
      confidence,
      conversationId: finalConversationId,
    };
  }

  /**
   * Generate rule-based response based on intent
   */
  private async generateRuleBasedResponse(
    intent: MessageIntent,
    message: string
  ): Promise<{ content: string; metadata?: Record<string, any> }> {
    switch (intent) {
      case "greeting":
        return {
          content:
            "Xin chào! Tôi là trợ lý AI của Hải Sản Ngày Mới. Tôi có thể giúp bạn:\n\n" +
            "📊 Tra cứu doanh thu và đơn hàng\n" +
            "👥 Thông tin khách hàng\n" +
            "📦 Tra cứu sản phẩm\n" +
            "🎯 Phân tích chiến dịch marketing\n" +
            "💬 Quản lý tickets hỗ trợ\n\n" +
            "Bạn cần tôi hỗ trợ gì?",
        };

      case "revenue_query":
        return {
          content:
            "Để xem báo cáo doanh thu chi tiết, bạn có thể:\n\n" +
            "1. Truy cập trang **Analytics > Revenue** để xem:\n" +
            "   - Tổng doanh thu theo thời gian\n" +
            "   - So sánh với kỳ trước\n" +
            "   - Top sản phẩm và khách hàng\n\n" +
            "2. Hoặc hỏi tôi cụ thể hơn:\n" +
            "   - 'Doanh thu hôm nay'\n" +
            "   - 'Doanh thu tuần này'\n" +
            "   - 'So sánh doanh thu tháng này với tháng trước'",
          metadata: { suggestedRoute: "/admin/analytics/revenue" },
        };

      case "customer_query":
        return {
          content:
            "Về quản lý khách hàng, tôi có thể giúp bạn:\n\n" +
            "📊 **Phân tích khách hàng:**\n" +
            "   - Phân khúc RFM (Recency, Frequency, Monetary)\n" +
            "   - Nhận diện khách hàng có nguy cơ rời bỏ\n" +
            "   - Phân tích cohort retention\n\n" +
            "👥 **Quản lý khách hàng:**\n" +
            "   - Xem danh sách khách hàng: /admin/customers\n" +
            "   - Phân tích hành vi: /admin/analytics/customer\n\n" +
            "Bạn muốn xem thông tin gì cụ thể?",
          metadata: { suggestedRoute: "/admin/analytics/customer" },
        };

      case "order_query":
        return {
          content:
            "Về đơn hàng, tôi có thể hỗ trợ:\n\n" +
            "📦 **Quản lý đơn hàng:**\n" +
            "   - Xem danh sách đơn hàng: /admin/orders\n" +
            "   - Lọc theo trạng thái (pending, confirmed, shipping, etc.)\n" +
            "   - Tra cứu đơn hàng theo mã\n\n" +
            "📊 **Thống kê đơn hàng:**\n" +
            "   - Phân bố theo trạng thái\n" +
            "   - Tỷ lệ hủy đơn\n" +
            "   - Thời gian xử lý trung bình\n\n" +
            "Bạn cần xem thông tin gì?",
          metadata: { suggestedRoute: "/admin/managements/orders" },
        };

      case "product_query":
        return {
          content:
            "Về sản phẩm, tôi có thể giúp:\n\n" +
            "📦 **Quản lý sản phẩm:**\n" +
            "   - Danh sách sản phẩm: /admin/products\n" +
            "   - Quản lý kho hàng\n" +
            "   - Cập nhật giá và thông tin\n\n" +
            "📊 **Phân tích sản phẩm:**\n" +
            "   - Top sản phẩm bán chạy\n" +
            "   - Sản phẩm sắp hết hàng\n" +
            "   - Doanh thu theo danh mục\n\n" +
            "Bạn muốn xem gì?",
          metadata: { suggestedRoute: "/admin/managements/products" },
        };

      case "staff_performance":
        return {
          content:
            "Về hiệu suất nhân viên:\n\n" +
            "🏆 **Bảng xếp hạng:**\n" +
            "   - Top nhân viên theo doanh số\n" +
            "   - Số đơn hàng xử lý\n" +
            "   - Đánh giá từ khách hàng\n\n" +
            "📊 **Chi tiết:**\n" +
            "   - Xu hướng hiệu suất theo thời gian\n" +
            "   - So sánh giữa các thành viên\n" +
            "   - Hoạt động gần đây\n\n" +
            "Xem chi tiết tại: /admin/analytics/staff",
          metadata: { suggestedRoute: "/admin/analytics/staff" },
        };

      case "campaign_analytics":
        return {
          content:
            "Về chiến dịch marketing:\n\n" +
            "📊 **Phân tích hiệu quả:**\n" +
            "   - ROI của từng chiến dịch\n" +
            "   - So sánh hiệu suất giữa các nền tảng\n" +
            "   - Tỷ lệ chuyển đổi\n\n" +
            "🎯 **Chi tiết chiến dịch:**\n" +
            "   - Facebook, TikTok, Zalo\n" +
            "   - Doanh thu và chi phí\n" +
            "   - Engagement metrics\n\n" +
            "Xem chi tiết tại: /admin/analytics/campaign",
          metadata: { suggestedRoute: "/admin/analytics/campaign" },
        };

      case "ticket_query":
        return {
          content:
            "Về hệ thống support tickets:\n\n" +
            "🎫 **Quản lý tickets:**\n" +
            "   - Danh sách tickets: /admin/customer-care/tickets\n" +
            "   - Lọc theo trạng thái (open, in_progress, resolved)\n" +
            "   - Phân bổ cho nhân viên\n\n" +
            "📊 **Thống kê:**\n" +
            "   - Tickets đang mở\n" +
            "   - Thời gian xử lý trung bình\n" +
            "   - Tickets quá hạn SLA\n\n" +
            "Bạn muốn xem gì?",
          metadata: { suggestedRoute: "/admin/customer-care/tickets" },
        };

      case "general_help":
        return {
          content:
            "Tôi có thể giúp bạn với:\n\n" +
            "📊 **Analytics:**\n" +
            "   - Doanh thu và đơn hàng\n" +
            "   - Phân tích khách hàng\n" +
            "   - Hiệu suất nhân viên\n" +
            "   - Chiến dịch marketing\n\n" +
            "🛠 **Quản lý:**\n" +
            "   - Đơn hàng\n" +
            "   - Sản phẩm\n" +
            "   - Khách hàng\n" +
            "   - Support tickets\n\n" +
            "💡 **Mẹo:** Hãy hỏi tôi các câu hỏi cụ thể như:\n" +
            "   - 'Doanh thu tháng này là bao nhiêu?'\n" +
            "   - 'Có bao nhiêu đơn hàng đang chờ xử lý?'\n" +
            "   - 'Top 5 sản phẩm bán chạy nhất?'",
        };

      default:
        return {
          content:
            "Xin lỗi, tôi chưa hiểu rõ câu hỏi của bạn. 🤔\n\n" +
            "Bạn có thể hỏi tôi về:\n" +
            "- Doanh thu và đơn hàng\n" +
            "- Khách hàng\n" +
            "- Sản phẩm\n" +
            "- Hiệu suất nhân viên\n" +
            "- Chiến dịch marketing\n" +
            "- Support tickets\n\n" +
            "Hoặc gõ 'help' để xem danh sách đầy đủ.",
        };
    }
  }

  /**
   * Generate AI-powered response using LLM
   */
  private async generateAIResponse(
    message: string,
    intent: MessageIntent,
    conversationHistory: ChatMessage[]
  ): Promise<string> {
    try {
      const llmService = getLLMService();

      // Build context from conversation history
      const context = conversationHistory
        .slice(-5) // Last 5 messages for context
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join("\n");

      const systemPrompt =
        "Bạn là trợ lý AI của hệ thống CRM Hải Sản Ngày Mới. " +
        "Nhiệm vụ của bạn là hỗ trợ nhân viên tra cứu thông tin về:\n" +
        "- Doanh thu và báo cáo tài chính\n" +
        "- Quản lý khách hàng và phân tích hành vi\n" +
        "- Đơn hàng và sản phẩm\n" +
        "- Hiệu suất nhân viên\n" +
        "- Chiến dịch marketing\n" +
        "- Tickets hỗ trợ khách hàng\n\n" +
        "Hãy trả lời bằng tiếng Việt, ngắn gọn, rõ ràng và hữu ích. " +
        "Nếu cần tra cứu dữ liệu cụ thể, hãy hướng dẫn người dùng đến đúng trang trong hệ thống.";

      const prompt = context
        ? `Ngữ cảnh trò chuyện trước:\n${context}\n\nCâu hỏi mới: ${message}`
        : message;

      const response = await llmService.generateCompletion({
        prompt,
        systemPrompt,
        maxTokens: 512,
        temperature: 0.7,
      });

      return response.content;
    } catch (error) {
      console.error("AI response generation failed:", error);
      // Fallback to rule-based response
      const fallback = await this.generateRuleBasedResponse(intent, message);
      return fallback.content;
    }
  }

  /**
   * Get conversation by ID
   */
  async getConversation(conversationId: string): Promise<ChatConversation | null> {
    const collection = await this.getCollection();
    const doc = await collection.findOne({ _id: new ObjectId(conversationId) });

    if (!doc) return null;

    return {
      ...(doc as any),
      id: conversationId,
    } as ChatConversation;
  }

  /**
   * Get user's conversations
   */
  async getUserConversations(userId: string): Promise<ChatConversation[]> {
    const collection = await this.getCollection();
    const docs = await collection.find({ userId }).sort({ updatedAt: -1 }).limit(50).toArray();

    return docs.map((doc: any) => ({
      ...doc,
      id: doc._id.toString(),
    })) as ChatConversation[];
  }

  /**
   * Archive a conversation
   */
  async archiveConversation(conversationId: string): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.updateOne(
      { _id: new ObjectId(conversationId) },
      { $set: { status: "archived", updatedAt: new Date() } }
    );

    return result.modifiedCount > 0;
  }

  /**
   * Save conversation to database
   */
  private async saveConversation(conversation: ChatConversation): Promise<void> {
    const collection = await this.getCollection();

    await collection.updateOne(
      { _id: new ObjectId(conversation.id) },
      { $set: conversation },
      { upsert: true }
    );
  }
}
