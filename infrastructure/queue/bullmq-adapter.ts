import { Queue } from 'bullmq';
import type { QueueService, QueueJobData } from '@/core/application/interfaces/queue-service';

export class BullMQAdapter implements QueueService {
  private queues: Map<string, Queue> = new Map();

  private getQueue(queueName: string): Queue {
    if (!this.queues.has(queueName)) {
      const connection = {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        username: process.env.REDIS_USERNAME,
      };

      const queue = new Queue(queueName, {
        connection,
        defaultJobOptions: {
          removeOnComplete: 50,
          removeOnFail: 100,
        },
      });

      this.queues.set(queueName, queue);
    }

    return this.queues.get(queueName)!;
  }

  async addJob(
    queueName: string,
    jobName: string,
    data: any,
    options: { delay?: number; priority?: number } = {}
  ): Promise<string> {
    const queue = this.getQueue(queueName);

    const job = await queue.add(jobName, data, {
      delay: options.delay,
      priority: options.priority,
    });

    console.log(`[BullMQAdapter] Added job ${job.id || 'unknown'} to queue ${queueName}`);
    return job.id || '';
  }

  // Cleanup method
  async close(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName);
    if (queue) {
      await queue.close();
      this.queues.delete(queueName);
    }
  }

  async closeAll(): Promise<void> {
    for (const [queueName, queue] of this.queues) {
      await queue.close();
    }
    this.queues.clear();
  }
}
