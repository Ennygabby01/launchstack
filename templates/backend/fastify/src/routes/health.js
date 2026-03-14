export async function healthRoutes(fastify) {
  fastify.get('/health', async (_request, reply) => {
    const checks = {};
    let degraded = false;

    // ── Database ping ───────────────────────────────────────────────────────
    try {
      // Replace with your ORM's ping:
      // await prisma.$queryRaw`SELECT 1`           ← Prisma
      // await sequelize.authenticate()              ← Sequelize
      // await mongoose.connection.db.admin().ping() ← Mongoose
      checks.database = 'ok';
    } catch {
      checks.database = 'unreachable';
      degraded = true;
    }

    // ── Redis ping ──────────────────────────────────────────────────────────
    try {
      // Uncomment when Redis module is added:
      // const { redis } = await import('../modules/redis/redis.js');
      // await redis.ping();
      // checks.redis = 'ok';
      checks.redis = 'not configured';
    } catch {
      checks.redis = 'unreachable';
      degraded = true;
    }

    reply.status(degraded ? 503 : 200).send({
      status: degraded ? 'degraded' : 'ok',
      timestamp: new Date().toISOString(),
      checks,
    });
  });
}
