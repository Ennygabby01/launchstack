import { Injectable } from '@nestjs/common';
import { Queue, Worker } from 'bullmq';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
};

@Injectable()
export class QueueService {
  createQueue(name: string): Queue {
    return new Queue(name, { connection });
  }

  createWorker(queueName: string, processor: (job: any) => Promise<any>): Worker {
    const worker = new Worker(queueName, processor, { connection });

    worker.on('completed', (job) => {
      console.log(`Job ${job.id} completed in queue ${queueName}`);
    });

    worker.on('failed', (job, err) => {
      console.error(`Job ${job?.id} failed in queue ${queueName}:`, err.message);
    });

    return worker;
  }
}
