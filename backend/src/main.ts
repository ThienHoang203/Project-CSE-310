import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { winstonLogger } from './logger/winston.logger';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import session from 'express-session';
import passport from 'passport';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: winstonLogger,
  });
  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT') || 3000;

  // app.use(new LoggerMiddleware().use);

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
              [error.property]: error.constraints
                ? Object.values(error.constraints)[0]
                : 'unknown error',
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

  app.use(
    session({
      name: 'NESTJS_SESSION_ID',
      secret: '08b10578-099f-4704-b406-67740ca49aee',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 6 * 60 * 60 * 1000,
      },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(cookieParser());
  await app.listen(port);
}
bootstrap();
