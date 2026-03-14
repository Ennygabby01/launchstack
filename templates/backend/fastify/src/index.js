import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { healthRoutes } from './routes/health.js';

const fastify = Fastify({ logger: true });
const PORT = Number(process.env.PORT) || 3000;

await fastify.register(cors);
await fastify.register(helmet);
await fastify.register(healthRoutes, { prefix: '/api' });

fastify.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
