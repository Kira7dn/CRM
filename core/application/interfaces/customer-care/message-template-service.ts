import type {
  MessageTemplate,
  TemplateCategory,
  TemplatePlatform,
} from "@/core/domain/customers/message-template";

export interface MessageTemplatePayload extends Partial<MessageTemplate> { }

export interface MessageTemplateFilterOptions {
  category?: TemplateCategory;
  platform?: TemplatePlatform;
  isActive?: boolean;
  search?: string; // Search by name or content
}

export interface MessageTemplateService {
  /**
   * Get all templates with optional filtering
   */
  getAll(options?: MessageTemplateFilterOptions): Promise<MessageTemplate[]>;

  /**
   * Get template by ID
   */
  getById(id: string): Promise<MessageTemplate | null>;

  /**
   * Get templates by category
   */
  getByCategory(category: TemplateCategory): Promise<MessageTemplate[]>;

  /**
   * Get templates by platform
   */
  getByPlatform(platform: TemplatePlatform): Promise<MessageTemplate[]>;

  /**
   * Create new template
   */
  create(payload: MessageTemplatePayload): Promise<MessageTemplate>;

  /**
   * Update existing template
   */
  update(payload: MessageTemplatePayload): Promise<MessageTemplate | null>;

  /**
   * Delete template
   */
  delete(id: string): Promise<boolean>;

  /**
   * Increment usage count
   */
  incrementUsage(id: string): Promise<void>;

  /**
   * Clone template
   */
  clone(id: string, newName: string): Promise<MessageTemplate>;
}
