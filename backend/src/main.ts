import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { LoggingMiddleware } from './middleware/logging/logging.middleware';
import { AllHttpExceptionFilter } from './exceptions/http-exception.filter';
import { LoggerMiddleware } from './middleware/logger/logger.middleware';
import { winstonLogger } from './logger/winston.logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: winstonLogger,
  });

  app.use(new LoggerMiddleware().use);

  // app.useLogger(['log']);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      skipMissingProperties: false,
      stopAtFirstError: false,
      transform: true,
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        return new BadRequestException(
          validationErrors.map((error) => {
            return {
              [error.property]: error.constraints ? Object.values(error.constraints)[0] : 'unknown error',
            };
          }),
        );
      },
    }),
  );
  // app.useGlobalFilters(new AllHttpExceptionFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
