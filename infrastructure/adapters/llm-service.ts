/**
 * LLM Service using Anthropic Claude API
 * Provides AI capabilities for chatbot and content generation
 */

import Anthropic from "@anthropic-ai/sdk";

/**
 * LLM Request configuration
 */
export interface LLMRequest {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

/**
 * LLM Response
 */
export interface LLMResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  model: string;
}

/**
 * LLM Service class
 */
export class LLMService {
  private client: Anthropic;
  private readonly defaultModel = "claude-3-5-sonnet-20241022";
  private readonly defaultMaxTokens = 1024;
  private readonly defaultTemperature = 0.7;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY environment variable is required");
    }

    this.client = new Anthropic({
      apiKey,
    });
  }

  /**
   * Generate completion using Claude API
   */
  async generateCompletion(request: LLMRequest): Promise<LLMResponse> {
    try {
      const response = await this.client.messages.create({
        model: request.model || this.defaultModel,
        max_tokens: request.maxTokens || this.defaultMaxTokens,
        temperature: request.temperature ?? this.defaultTemperature,
        system: request.systemPrompt,
        messages: [
          {
            role: "user",
            content: request.prompt,
          },
        ],
      });

      // Extract text content from response
      const textContent = response.content
        .filter((block) => block.type === "text")
        .map((block) => (block.type === "text" ? block.text : ""))
        .join("");

      return {
        content: textContent,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
        model: response.model,
      };
    } catch (error) {
      console.error("LLM Service Error:", error);
      throw new Error(`Failed to generate completion: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate streaming completion (for future real-time features)
   */
  async *generateStreamingCompletion(request: LLMRequest): AsyncGenerator<string, void, unknown> {
    try {
      const stream = await this.client.messages.create({
        model: request.model || this.defaultModel,
        max_tokens: request.maxTokens || this.defaultMaxTokens,
        temperature: request.temperature ?? this.defaultTemperature,
        system: request.systemPrompt,
        messages: [
          {
            role: "user",
            content: request.prompt,
          },
        ],
        stream: true,
      });

      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          yield event.delta.text;
        }
      }
    } catch (error) {
      console.error("LLM Streaming Error:", error);
      throw new Error(`Failed to generate streaming completion: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Check if API key is configured
   */
  static isConfigured(): boolean {
    return !!process.env.ANTHROPIC_API_KEY;
  }
}

/**
 * Singleton instance
 */
let llmServiceInstance: LLMService | null = null;

/**
 * Get LLM Service instance
 */
export function getLLMService(): LLMService {
  if (!llmServiceInstance) {
    if (!LLMService.isConfigured()) {
      throw new Error("LLM Service is not configured. Please set ANTHROPIC_API_KEY environment variable.");
    }
    llmServiceInstance = new LLMService();
  }
  return llmServiceInstance;
}
