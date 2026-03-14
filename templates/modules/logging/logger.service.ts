import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import winston from 'winston';

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        ),
      }),
      new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
      new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
  });

  log(message: string) { this.logger.info(message); }
  error(message: string, trace?: string) { this.logger.error(message, { trace }); }
  warn(message: string) { this.logger.warn(message); }
  debug(message: string) { this.logger.debug(message); }
  verbose(message: string) { this.logger.verbose(message); }
}
