import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { LoggerMiddleware } from './middleware/logger/logger.middleware';
import { winstonLogger } from './logger/winston.logger';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: winstonLogger,
  });
  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT') || 3000;

  app.use(new LoggerMiddleware().use);

  // app.useLogger(['log']);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      skipMissingProperties: false,
      stopAtFirstError: true,
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
  app.setGlobalPrefix('api', { exclude: [''] });
  app.useStaticAssets(join(process.cwd(), configService.get<string>('UPLOAD_FOLDER') || 'upload'), {
    prefix: 'uploads',
  });
  app.enableCors();
  await app.listen(port);
}
bootstrap();
