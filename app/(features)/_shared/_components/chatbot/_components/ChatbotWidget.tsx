"use client";

import { useState, useRef, useEffect } from "react";
import { sendChatMessageAction } from "../actions";
import { Button } from "@/@shared/ui/button";
import { Input } from "@/@shared/ui/input";
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Loader2,
  Minimize2,
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

interface ChatbotWidgetProps {
  userId: string;
  userName?: string;
}

export function ChatbotWidget({ userId, userName = "User" }: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [useAI, setUseAI] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            "Xin chào! Tôi là trợ lý AI của Hải Sản Ngày Mới. Tôi có thể giúp bạn tra cứu thông tin về doanh thu, khách hàng, đơn hàng, sản phẩm và nhiều hơn nữa. Bạn cần tôi hỗ trợ gì?",
          createdAt: new Date(),
        },
      ]);
    }
  }, [isOpen, messages.length]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: inputValue,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const result = await sendChatMessageAction(
        inputValue,
        userId,
        conversationId,
        useAI
      );

      if (result.error) {
        // Error response
        const errorMessage: ChatMessage = {
          id: `msg_${Date.now()}`,
          role: "assistant",
          content: `Xin lỗi, đã có lỗi xảy ra: ${result.error}`,
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } else {
        // Success response
        const assistantMessage: ChatMessage = {
          id: result.message.id,
          role: "assistant",
          content: result.message.content,
          createdAt: new Date(result.message.createdAt),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setConversationId(result.conversationId);
      }
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        role: "assistant",
        content: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.",
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setConversationId(undefined);
  };

  if (!isOpen) {
    // Floating button
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all hover:scale-110"
        aria-label="Open chatbot"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    );
  }

  // Chat widget
  return (
    <div className="fixed bottom-6 right-6 z-50 w-[400px] h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          <div>
            <h3 className="font-semibold">Trợ lý AI</h3>
            <p className="text-xs text-blue-100">Hải Sản Ngày Mới</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* AI Toggle */}
          <button
            onClick={() => setUseAI(!useAI)}
            className={`p-1.5 rounded-lg transition-colors ${useAI
              ? "bg-blue-500 hover:bg-blue-400"
              : "bg-blue-700/50 hover:bg-blue-600/50"
              }`}
            title={useAI ? "AI Mode (Claude)" : "Rule-based Mode"}
          >
            <Sparkles className={`w-4 h-4 ${useAI ? "text-yellow-300" : "text-gray-300"}`} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-blue-600 rounded-lg transition-colors"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"
              }`}
          >
            {message.role === "assistant" && (
              <div className="shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-lg px-4 py-2 ${message.role === "user"
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
            {message.role === "user" && (
              <div className="shrink-0 w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2 justify-start">
            <div className="shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Đang suy nghĩ...
                </span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>
            {useAI ? (
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-yellow-500" />
                AI Mode (Claude)
              </span>
            ) : (
              "Rule-based Mode"
            )}
          </span>
          {messages.length > 1 && (
            <button
              onClick={handleClearChat}
              className="hover:text-gray-700 dark:hover:text-gray-300 underline"
            >
              Clear chat
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
