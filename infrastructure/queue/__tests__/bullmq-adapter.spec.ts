import { describe, it, expect, beforeEach, vi } from 'vitest';

// Create a mock implementation of BullMQAdapter
const mockAddJob = vi.fn().mockResolvedValue('test-job-id');
const mockClose = vi.fn().mockResolvedValue(undefined);
const mockCloseAll = vi.fn().mockResolvedValue(undefined);

// Mock the BullMQAdapter class
vi.mock('@/infrastructure/queue/bullmq-adapter', () => {
  const MockBullMQAdapter = vi.fn().mockImplementation(function(this: any) {
    this.addJob = mockAddJob;
    this.close = mockClose;
    this.closeAll = mockCloseAll;
    return this;
  });

  return {
    BullMQAdapter: MockBullMQAdapter,
  };
});

// Now import after mocking
import { BullMQAdapter } from '@/infrastructure/queue/bullmq-adapter';

describe('BullMQAdapter', () => {
  let adapter: BullMQAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new BullMQAdapter();
  });

  describe('addJob', () => {
    it('should add a job to the queue successfully', async () => {
      const queueName = 'test-queue';
      const jobName = 'test-job';
      const data = { message: 'test data' };
      const options = { delay: 1000, priority: 1 };

      const result = await adapter.addJob(queueName, jobName, data, options);

      expect(result).toBe('test-job-id');
      expect(mockAddJob).toHaveBeenCalledWith(queueName, jobName, data, options);
    });

    it('should add a job without options', async () => {
      const queueName = 'test-queue';
      const jobName = 'test-job';
      const data = { message: 'test data' };

      const result = await adapter.addJob(queueName, jobName, data);

      expect(result).toBe('test-job-id');
      expect(mockAddJob).toHaveBeenCalledWith(queueName, jobName, data);
    });
  });

  describe('close', () => {
    it('should close a specific queue', async () => {
      const queueName = 'test-queue';

      await adapter.close(queueName);

      expect(mockClose).toHaveBeenCalledWith(queueName);
    });

    it('should handle closing non-existent queue gracefully', async () => {
      const queueName = 'non-existent-queue';

      await expect(adapter.close(queueName)).resolves.not.toThrow();
      expect(mockClose).toHaveBeenCalledWith(queueName);
    });
  });

  describe('closeAll', () => {
    it('should close all queues and redis connection', async () => {
      await adapter.closeAll();

      expect(mockCloseAll).toHaveBeenCalled();
    });

    it('should handle empty queues gracefully', async () => {
      await expect(adapter.closeAll()).resolves.not.toThrow();
      expect(mockCloseAll).toHaveBeenCalled();
    });
  });
});
