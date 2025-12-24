// infrastructure/queue/qstash-adapter.ts
import { Client } from "@upstash/qstash"
import type { QueueService } from "@/core/application/interfaces/queue-service"

export class QStashAdapter implements QueueService {
  private client: Client

  constructor() {
    if (!process.env.QSTASH_TOKEN) {
      throw new Error("QSTASH_TOKEN is required")
    }

    this.client = new Client({
      token: process.env.QSTASH_TOKEN,
    })
  }

  /**
   * queueName  → logical group (ex: "scheduled-post")
   * jobName    → event type (ex: "publish-facebook-post")
   */
  async addJob(
    queueName: string,
    jobName: string,
    data: any,
    options: { delay?: number; jobId?: string } = {}
  ): Promise<string> {
    const res = await this.client.publishJSON({
      // url: `http://localhost:4001/api/posts/${queueName}`,
      url: `${process.env.APP_URL}/api/posts/${queueName}`,
      body: {
        type: jobName,
        jobId: options.jobId,
        payload: data,
      },
      delay: Math.floor((options.delay ?? 0) / 1000),
    })
    console.log("[QStashAdapter] addJob", options.jobId);

    return options.jobId ?? res.messageId
  }


  /**
   * QStash không support remove job hoàn chỉnh
   * → chỉ revoke nếu bạn lưu messageId + token
   */
  async removeJob(_queueName: string, jobId: string): Promise<boolean> {
    try {
      await this.client.messages.delete(jobId)
      console.log(`[QStashAdapter] Revoked job ${jobId}`)
      return true
    } catch (err) {
      console.warn(
        `[QStashAdapter] Failed to revoke job ${jobId} (might already be delivered)`
      )
      return false
    }
  }
}
