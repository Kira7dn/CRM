/**
 * Email Service
 * Sprint 7 - Email Notifications
 *
 * Provides email sending capabilities using nodemailer.
 * Supports templates, attachments, and queue-based sending.
 */

import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
  }>;
  cc?: string | string[];
  bcc?: string | string[];
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static instance: EmailService;
  private transporter: Transporter<SMTPTransport.SentMessageInfo> | null = null;
  private isConfigured = false;

  private constructor() {
    this.initialize();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Initialize email transporter
   */
  private initialize(): void {
    // Check if SMTP is configured
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !port || !user || !pass) {
      console.warn(
        "[EmailService] SMTP not configured. Email sending will be skipped."
      );
      console.warn(
        "[EmailService] Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env.local"
      );
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host,
        port: parseInt(port),
        secure: port === "465", // true for 465, false for other ports
        auth: {
          user,
          pass,
        },
      });

      this.isConfigured = true;
      console.log("[EmailService] Initialized successfully");
    } catch (error) {
      console.error("[EmailService] Initialization error:", error);
    }
  }

  /**
   * Send email
   */
  async send(options: EmailOptions): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      console.warn("[EmailService] Skipping email - SMTP not configured");
      return false;
    }

    try {
      const from = process.env.SMTP_FROM || process.env.SMTP_USER;

      await this.transporter.sendMail({
        from: `"Hải Sản Ngày Mới" <${from}>`,
        to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments,
        cc: options.cc,
        bcc: options.bcc,
      });

      console.log(`[EmailService] Email sent to ${options.to}`);
      return true;
    } catch (error) {
      console.error("[EmailService] Send error:", error);
      return false;
    }
  }

  /**
   * Send email with template
   */
  async sendTemplate(
    to: string | string[],
    template: EmailTemplate,
    variables: Record<string, any> = {}
  ): Promise<boolean> {
    // Replace variables in template
    let html = template.html;
    let text = template.text || "";
    let subject = template.subject;

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, "g");
      html = html.replace(regex, String(value));
      text = text.replace(regex, String(value));
      subject = subject.replace(regex, String(value));
    }

    return await this.send({
      to,
      subject,
      html,
      text,
    });
  }

  /**
   * Check if email service is configured
   */
  isReady(): boolean {
    return this.isConfigured;
  }

  /**
   * Verify SMTP connection
   */
  async verify(): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      console.log("[EmailService] SMTP connection verified");
      return true;
    } catch (error) {
      console.error("[EmailService] SMTP verification failed:", error);
      return false;
    }
  }
}

/**
 * Convenience function to get email service
 */
export function getEmailService(): EmailService {
  return EmailService.getInstance();
}

/**
 * Common email templates
 */
export const EmailTemplates = {
  /**
   * Order confirmation email
   */
  orderConfirmation: (orderId: string, customerName: string, total: number): EmailTemplate => ({
    subject: "Xác nhận đơn hàng #{{orderNumber}}",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Cảm ơn quý khách đã đặt hàng!</h2>
        <p>Xin chào <strong>{{customerName}}</strong>,</p>
        <p>Chúng tôi đã nhận được đơn hàng <strong>#{{orderNumber}}</strong> của quý khách.</p>

        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Thông tin đơn hàng</h3>
          <p>Mã đơn hàng: <strong>#{{orderNumber}}</strong></p>
          <p>Tổng tiền: <strong>{{total}} VNĐ</strong></p>
        </div>

        <p>Chúng tôi sẽ liên hệ với quý khách sớm nhất để xác nhận đơn hàng.</p>

        <p style="margin-top: 30px;">Trân trọng,<br><strong>Hải Sản Ngày Mới</strong></p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">
          Email này được gửi tự động. Vui lòng không trả lời email này.
        </p>
      </div>
    `,
    text: `
Xin chào {{customerName}},

Chúng tôi đã nhận được đơn hàng #{{orderNumber}} của quý khách.

Tổng tiền: {{total}} VNĐ

Chúng tôi sẽ liên hệ với quý khách sớm nhất.

Trân trọng,
Hải Sản Ngày Mới
    `,
  }),

  /**
   * Ticket created notification
   */
  ticketCreated: (ticketNumber: string, customerName: string): EmailTemplate => ({
    subject: "Ticket hỗ trợ #{{ticketNumber}} đã được tạo",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Yêu cầu hỗ trợ của quý khách</h2>
        <p>Xin chào <strong>{{customerName}}</strong>,</p>
        <p>Chúng tôi đã tiếp nhận yêu cầu hỗ trợ của quý khách.</p>

        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>Mã ticket: <strong>#{{ticketNumber}}</strong></p>
        </div>

        <p>Đội ngũ hỗ trợ sẽ liên hệ với quý khách trong thời gian sớm nhất.</p>

        <p style="margin-top: 30px;">Trân trọng,<br><strong>Hải Sản Ngày Mới</strong></p>
      </div>
    `,
    text: `
Xin chào {{customerName}},

Chúng tôi đã tiếp nhận yêu cầu hỗ trợ #{{ticketNumber}} của quý khách.

Đội ngũ hỗ trợ sẽ liên hệ với quý khách trong thời gian sớm nhất.

Trân trọng,
Hải Sản Ngày Mới
    `,
  }),

  /**
   * Survey invitation
   */
  surveyInvitation: (customerName: string, surveyLink: string): EmailTemplate => ({
    subject: "Ý kiến của quý khách rất quan trọng với chúng tôi",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Khảo sát đánh giá dịch vụ</h2>
        <p>Xin chào <strong>{{customerName}}</strong>,</p>
        <p>Chúng tôi rất mong nhận được ý kiến đánh giá của quý khách về chất lượng dịch vụ.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{surveyLink}}"
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Tham gia khảo sát
          </a>
        </div>

        <p>Khảo sát chỉ mất 2-3 phút của quý khách.</p>

        <p style="margin-top: 30px;">Trân trọng,<br><strong>Hải Sản Ngày Mới</strong></p>
      </div>
    `,
    text: `
Xin chào {{customerName}},

Chúng tôi rất mong nhận được ý kiến đánh giá của quý khách về chất lượng dịch vụ.

Vui lòng truy cập: {{surveyLink}}

Trân trọng,
Hải Sản Ngày Mới
    `,
  }),
};
