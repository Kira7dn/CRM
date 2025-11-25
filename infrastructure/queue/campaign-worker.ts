/**
 * Campaign Worker
 * Sprint 7 - Email Campaigns
 *
 * Background job processor for sending email campaigns using BullMQ.
 */

import { Worker, Job, Queue } from "bullmq";
import Redis from "ioredis";
import { getEmailService } from "../adapters/email-service";

export interface CampaignJobData {
  campaignId: number;
  recipients: Array<{
    email: string;
    name: string;
    customerId: string;
  }>;
  template: {
    subject: string;
    html: string;
    text?: string;
  };
  variables?: Record<string, any>;
}

export interface EmailJobData {
  to: string;
  subject: string;
  html: string;
  text?: string;
  campaignId?: number;
  customerId?: string;
}

export class CampaignWorker {
  private worker: Worker<CampaignJobData | EmailJobData> | null = null;
  private emailQueue: Queue<EmailJobData> | null = null;
  private emailService = getEmailService();

  constructor() {
    if (process.env.ENABLE_CAMPAIGN_WORKER === "true") {
      this.initializeWorker();
    } else {
      console.log(
        "[CampaignWorker] Worker disabled. Set ENABLE_CAMPAIGN_WORKER=true to enable."
      );
    }
  }

  private initializeWorker(): void {
    const connection = new Redis(process.env.REDIS_URL!, {
      maxRetriesPerRequest: null,
    });

    this.worker = new Worker(
      "campaigns",
      async (job: Job<CampaignJobData | EmailJobData>) => {
        if (job.name === "send-campaign") {
          return await this.processCampaign(job as Job<CampaignJobData>);
        } else if (job.name === "send-email") {
          return await this.processEmail(job as Job<EmailJobData>);
        }
      },
      {
        connection,
        concurrency: 5, // Process 5 emails at a time
        limiter: {
          max: 100, // Max 100 emails
          duration: 60000, // Per minute (to avoid rate limits)
        },
      }
    );

    this.emailQueue = new Queue<EmailJobData>("campaigns", { connection });

    this.worker.on("completed", (job) => {
      console.log(`[CampaignWorker] Job ${job.id} completed`);
    });

    this.worker.on("failed", (job, err) => {
      console.error(`[CampaignWorker] Job ${job?.id} failed:`, err);
    });

    this.worker.on("error", (err) => {
      console.error("[CampaignWorker] Worker error:", err);
    });

    console.log("[CampaignWorker] Initialized and listening for jobs");
  }

  /**
   * Process campaign - break into individual email jobs
   */
  private async processCampaign(job: Job<CampaignJobData>): Promise<void> {
    const { campaignId, recipients, template, variables = {} } = job.data;

    console.log(
      `[CampaignWorker] Processing campaign ${campaignId} for ${recipients.length} recipients`
    );

    // Create individual email jobs for each recipient
    const emailJobs = recipients.map((recipient) => ({
      to: recipient.email,
      subject: this.replaceVariables(template.subject, {
        ...variables,
        customerName: recipient.name,
      }),
      html: this.replaceVariables(template.html, {
        ...variables,
        customerName: recipient.name,
      }),
      text: template.text
        ? this.replaceVariables(template.text, {
          ...variables,
          customerName: recipient.name,
        })
        : undefined,
      campaignId,
      customerId: recipient.customerId,
    }));

    // Add individual email jobs to queue
    if (this.emailQueue) {
      await this.emailQueue.addBulk(
        emailJobs.map((data, index) => ({
          name: "send-email",
          data,
          opts: {
            delay: index * 1000, // Stagger emails by 1 second
            attempts: 3,
            backoff: {
              type: "exponential",
              delay: 2000,
            },
          },
        }))
      );
    }

    console.log(
      `[CampaignWorker] Created ${emailJobs.length} email jobs for campaign ${campaignId}`
    );
  }

  /**
   * Process individual email
   */
  private async processEmail(job: Job<EmailJobData>): Promise<void> {
    const { to, subject, html, text, campaignId, customerId } = job.data;

    console.log(`[CampaignWorker] Sending email to ${to}`);

    const success = await this.emailService.send({
      to,
      subject,
      html,
      text,
    });

    if (!success) {
      throw new Error(`Failed to send email to ${to}`);
    }

    // TODO: Log email sent to interaction history
    console.log(
      `[CampaignWorker] Email sent to ${to}${campaignId ? ` (campaign ${campaignId})` : ""}`
    );
  }

  /**
   * Replace template variables
   */
  private replaceVariables(
    template: string,
    variables: Record<string, any>
  ): string {
    let result = template;

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, "g");
      result = result.replace(regex, String(value));
    }

    return result;
  }

  /**
   * Close worker
   */
  async close(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
      console.log("[CampaignWorker] Worker closed");
    }
  }
}

// Auto-start worker if this file is run directly
if (require.main === module) {
  const worker = new CampaignWorker();

  process.on("SIGTERM", async () => {
    console.log("[CampaignWorker] SIGTERM received, closing worker...");
    await worker.close();
    process.exit(0);
  });

  process.on("SIGINT", async () => {
    console.log("[CampaignWorker] SIGINT received, closing worker...");
    await worker.close();
    process.exit(0);
  });
}
