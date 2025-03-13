import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { BookModule } from './modules/book/book.module';
import { Book } from './entities/book.entity';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RefeshToken } from './entities/refesh-token.entity';
import { Rating } from './entities/rating.entity';
import { BorrowingTransaction } from './entities/borrowing-transaction.entity';
import { Fine } from './entities/fine.entity';
import { Reservation } from './entities/reservation.entity';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from './interceptor/transform.interceptor';
import { BorrowingTransactionModule } from './modules/borrowing-transaction/borrowing-transaction.module';
import { FineModule } from './modules/fine/fine.module';
import { RatingModule } from './modules/rating/rating.module';
import { ReservationModule } from './modules/reservation/reservation.module';
import { Bookshelf } from './entities/bookshelf.entity';
import { PassportModule } from '@nestjs/passport';
import ResetPassword from './entities/reset-password.entity';
import { RolesGuard } from './guards/roles.guard';
import { JwtStrategy } from './passports/jwt.strategy';
import { JwtRefreshTokenStrategy } from './passports/jwt-refresh-token.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AccessTokenInterceptor } from './interceptor/access-token.interceptor';
import { UserStatusInterceptor } from './interceptor/user-status.interceptor';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [
          User,
          Book,
          RefeshToken,
          Rating,
          BorrowingTransaction,
          Fine,
          Reservation,
          Bookshelf,
          ResetPassword,
        ],
        synchronize: true,
        logging: true,
      }),
    }),
    // register for mailer module
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAIL_HOST'),
          port: configService.get<number>('MAIL_PORT'),
          // pool: 15,
          ignoreTLS: true,
          secure: true,
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: '"No Reply" <no-reply@localhost>',
        },
        template: {
          dir: process.cwd() + '/src/mail/templates/',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
    //register configService into global
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PassportModule.register({
      session: true,
    }),
    UserModule,
    BookModule,
    AuthModule,
    BorrowingTransactionModule,
    FineModule,
    RatingModule,
    ReservationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtStrategy,
    JwtRefreshTokenStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AccessTokenInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: UserStatusInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
