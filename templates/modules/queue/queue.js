import { Queue, Worker } from 'bullmq';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
};

export function createQueue(name) {
  return new Queue(name, { connection });
}

export function createWorker(queueName, processor) {
  const worker = new Worker(queueName, processor, { connection });

  worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed in queue ${queueName}`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed in queue ${queueName}:`, err.message);
  });

  return worker;
}

// Default queue
export const defaultQueue = createQueue('default');

// Example worker (uncomment to use)
// createWorker('default', async (job) => {
//   console.log('Processing job:', job.name, job.data);
// });
