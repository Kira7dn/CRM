export interface QueueService {
  addJob(
    queueName: string,
    jobName: string,
    data: any,
    options?: {
      delay?: number;
      priority?: number;
    }
  ): Promise<string>; // Return job ID
}

export interface QueueJobData {
  type: string;
  data: Record<string, any>;
}
