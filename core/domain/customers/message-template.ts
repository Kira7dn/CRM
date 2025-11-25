/**
 * Domain: Message Template
 *
 * Message templates for automated and manual customer communications
 */

export type TemplateCategory =
  | "greeting"
  | "order_confirmation"
  | "order_update"
  | "payment_reminder"
  | "delivery_notification"
  | "feedback_request"
  | "promotion"
  | "support_response"
  | "general";

export type TemplatePlatform =
  | "zalo"
  | "facebook"
  | "telegram"
  | "sms"
  | "email"
  | "all";

export type TemplateVariableType = "text" | "number" | "date" | "currency";

export interface TemplateVariable {
  name: string; // e.g., "customer_name", "order_id", "total_amount"
  type: TemplateVariableType;
  required: boolean;
  defaultValue?: string;
  description?: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  platform: TemplatePlatform;
  subject?: string; // For email templates
  content: string; // Template content with variables like {{customer_name}}
  variables: TemplateVariable[];
  isActive: boolean;
  usageCount: number;
  lastUsedAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Parse variables from template content
 */
export function parseTemplateVariables(content: string): string[] {
  const regex = /\{\{([a-zA-Z0-9_]+)\}\}/g;
  const matches = content.matchAll(regex);
  const variables: string[] = [];

  for (const match of matches) {
    if (match[1] && !variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }

  return variables;
}

/**
 * Render template with provided data
 */
export function renderTemplate(
  template: MessageTemplate,
  data: Record<string, any>
): { content: string; errors: string[] } {
  let content = template.content;
  const errors: string[] = [];

  // Check for required variables
  for (const variable of template.variables) {
    if (variable.required && !(variable.name in data)) {
      errors.push(`Missing required variable: ${variable.name}`);
    }
  }

  if (errors.length > 0) {
    return { content, errors };
  }

  // Replace variables with actual values
  for (const variable of template.variables) {
    const value = data[variable.name] ?? variable.defaultValue ?? "";
    const regex = new RegExp(`\\{\\{${variable.name}\\}\\}`, "g");

    // Format value based on type
    let formattedValue = value.toString();
    if (variable.type === "currency" && typeof value === "number") {
      formattedValue = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(value);
    } else if (variable.type === "date" && value instanceof Date) {
      formattedValue = new Intl.DateTimeFormat("vi-VN").format(value);
    }

    content = content.replace(regex, formattedValue);
  }

  return { content, errors: [] };
}

/**
 * Validate message template
 */
export function validateMessageTemplate(
  template: Partial<MessageTemplate>
): string[] {
  const errors: string[] = [];

  if (!template.name || template.name.trim().length === 0) {
    errors.push("Template name is required");
  }

  if (!template.category) {
    errors.push("Template category is required");
  }

  if (!template.platform) {
    errors.push("Template platform is required");
  }

  if (!template.content || template.content.trim().length === 0) {
    errors.push("Template content is required");
  }

  if (template.platform === "email" && !template.subject) {
    errors.push("Subject is required for email templates");
  }

  // Validate that all variables in content are defined
  if (template.content && template.variables) {
    const parsedVars = parseTemplateVariables(template.content);
    const definedVars = template.variables.map((v) => v.name);

    for (const parsedVar of parsedVars) {
      if (!definedVars.includes(parsedVar)) {
        errors.push(
          `Variable {{${parsedVar}}} is used in content but not defined in variables`
        );
      }
    }
  }

  return errors;
}

/**
 * Common template variables used across templates
 */
export const COMMON_TEMPLATE_VARIABLES: Record<string, TemplateVariable> = {
  customer_name: {
    name: "customer_name",
    type: "text",
    required: true,
    description: "Customer's full name",
  },
  customer_phone: {
    name: "customer_phone",
    type: "text",
    required: false,
    description: "Customer's phone number",
  },
  order_id: {
    name: "order_id",
    type: "text",
    required: true,
    description: "Order ID",
  },
  order_total: {
    name: "order_total",
    type: "currency",
    required: true,
    description: "Total order amount",
  },
  order_status: {
    name: "order_status",
    type: "text",
    required: true,
    description: "Current order status",
  },
  tracking_number: {
    name: "tracking_number",
    type: "text",
    required: false,
    description: "Delivery tracking number",
  },
  delivery_date: {
    name: "delivery_date",
    type: "date",
    required: false,
    description: "Expected delivery date",
  },
  support_staff: {
    name: "support_staff",
    type: "text",
    required: false,
    description: "Support staff name",
  },
  product_name: {
    name: "product_name",
    type: "text",
    required: false,
    description: "Product name",
  },
  discount_amount: {
    name: "discount_amount",
    type: "currency",
    required: false,
    description: "Discount amount",
  },
  promo_code: {
    name: "promo_code",
    type: "text",
    required: false,
    description: "Promotion code",
  },
};

/**
 * Pre-defined template examples
 */
export const DEFAULT_TEMPLATES: Omit<
  MessageTemplate,
  "id" | "createdAt" | "updatedAt"
>[] = [
  {
    name: "Xác nhận đơn hàng",
    category: "order_confirmation",
    platform: "all",
    content:
      "Xin chào {{customer_name}}!\n\nĐơn hàng #{{order_id}} của bạn đã được xác nhận thành công.\n\nTổng tiền: {{order_total}}\n\nChúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận thông tin giao hàng.\n\nCảm ơn bạn đã tin tưởng Hải Sản Ngày Mới!",
    variables: [
      COMMON_TEMPLATE_VARIABLES.customer_name,
      COMMON_TEMPLATE_VARIABLES.order_id,
      COMMON_TEMPLATE_VARIABLES.order_total,
    ],
    isActive: true,
    usageCount: 0,
    createdBy: "system",
  },
  {
    name: "Thông báo giao hàng",
    category: "delivery_notification",
    platform: "all",
    content:
      "Xin chào {{customer_name}}!\n\nĐơn hàng #{{order_id}} của bạn đang được giao.\n\nMã vận đơn: {{tracking_number}}\nDự kiến giao: {{delivery_date}}\n\nVui lòng để ý điện thoại để nhận hàng nhé!",
    variables: [
      COMMON_TEMPLATE_VARIABLES.customer_name,
      COMMON_TEMPLATE_VARIABLES.order_id,
      COMMON_TEMPLATE_VARIABLES.tracking_number,
      COMMON_TEMPLATE_VARIABLES.delivery_date,
    ],
    isActive: true,
    usageCount: 0,
    createdBy: "system",
  },
  {
    name: "Nhắc nhở thanh toán",
    category: "payment_reminder",
    platform: "all",
    content:
      "Xin chào {{customer_name}}!\n\nĐơn hàng #{{order_id}} của bạn đang chờ thanh toán.\n\nSố tiền cần thanh toán: {{order_total}}\n\nVui lòng hoàn tất thanh toán để chúng tôi xử lý đơn hàng cho bạn.\n\nCảm ơn bạn!",
    variables: [
      COMMON_TEMPLATE_VARIABLES.customer_name,
      COMMON_TEMPLATE_VARIABLES.order_id,
      COMMON_TEMPLATE_VARIABLES.order_total,
    ],
    isActive: true,
    usageCount: 0,
    createdBy: "system",
  },
  {
    name: "Yêu cầu đánh giá",
    category: "feedback_request",
    platform: "all",
    content:
      "Xin chào {{customer_name}}!\n\nCảm ơn bạn đã mua hàng tại Hải Sản Ngày Mới.\n\nBạn có thể dành vài phút đánh giá về đơn hàng #{{order_id}} không?\n\nÝ kiến của bạn rất quan trọng với chúng tôi!",
    variables: [
      COMMON_TEMPLATE_VARIABLES.customer_name,
      COMMON_TEMPLATE_VARIABLES.order_id,
    ],
    isActive: true,
    usageCount: 0,
    createdBy: "system",
  },
];
