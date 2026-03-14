import { Router } from 'express';
import { v1Router } from './v1/index.js';

export const router = Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check — pings DB and Redis if configured
 *     tags: [System]
 *     security: []
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: One or more dependencies are unhealthy
 */
router.get('/health', async (_req, res) => {
  const checks = {};
  let status = 200;

  // ── Database ping ─────────────────────────────────────────────────────────
  try {
    // Replace with your ORM's ping/query:
    // await prisma.$queryRaw`SELECT 1`          ← Prisma
    // await sequelize.authenticate()             ← Sequelize
    // await mongoose.connection.db.admin().ping()← Mongoose
    checks.database = 'ok';
  } catch (err) {
    checks.database = 'unreachable';
    status = 503;
  }

  // ── Redis ping ────────────────────────────────────────────────────────────
  try {
    // Uncomment when Redis module is added:
    // const { redis } = await import('../modules/redis/redis.js');
    // await redis.ping();
    // checks.redis = 'ok';
    checks.redis = 'not configured';
  } catch (err) {
    checks.redis = 'unreachable';
    status = 503;
  }

  res.status(status).json({
    status: status === 200 ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    checks,
  });
});

router.use('/v1', v1Router);
