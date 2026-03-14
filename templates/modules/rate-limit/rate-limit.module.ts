import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { RateLimitMiddleware } from './rate-limit.middleware';

@Module({})
export class RateLimitModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RateLimitMiddleware).forRoutes('*');
  }
}
