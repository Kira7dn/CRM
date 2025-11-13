import { Queue } from 'bullmq';
import Redis from 'ioredis';
import type { QueueService } from '@/core/application/interfaces/queue-service';

export class BullMQAdapter implements QueueService {
  private queues: Map<string, Queue> = new Map();

  // Lazy initialization of Redis connection
  private get redisConnection(): Redis {
    // Create singleton Redis connection on first access
    if (!(globalThis as any).__bullmqRedisConnection) {
      (globalThis as any).__bullmqRedisConnection = new Redis(process.env.REDIS_URL!, {
        maxRetriesPerRequest: null, // BullMQ requires this to be null
        lazyConnect: true,
      });
    }
    return (globalThis as any).__bullmqRedisConnection;
  }

  private getQueue(queueName: string): Queue {
    if (!this.queues.has(queueName)) {
      const queue = new Queue(queueName, {
        connection: this.redisConnection,
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
    await this.redisConnection.quit();
  }
}
