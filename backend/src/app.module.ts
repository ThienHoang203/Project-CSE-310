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
import { Wishlist } from './entities/wishlist.entity';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from './interceptor/transform.interceptor';
import { BorrowingTransactionModule } from './modules/borrowing-transaction/borrowing-transaction.module';
import { FineModule } from './modules/fine/fine.module';
import { RatingModule } from './modules/rating/rating.module';
import { RefreshTokenModule } from './modules/refresh-token/refresh-token.module';
import { ReservationModule } from './modules/reservation/reservation.module';
import { FilesModule } from './modules/files/files.module';

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
        entities: [User, Book, RefeshToken, Rating, BorrowingTransaction, Fine, Reservation, Wishlist],
        synchronize: true,
        logging: true,
      }),
    }),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAIL_HOST'),
          port: configService.get<number>('MAIL_PORT'),
          // pool: true,
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
          adapter: new HandlebarsAdapter(), // or new PugAdapter() or new EjsAdapter()
          options: {
            strict: true,
          },
        },
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule,
    BookModule,
    AuthModule,
    WishlistModule,
    BorrowingTransactionModule,
    FineModule,
    RatingModule,
    RefreshTokenModule,
    ReservationModule,
    FilesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer.apply(LoggingMiddleware).forRoutes({
  //     path: '/book',
  //     method: RequestMethod.ALL,
  //   });
  // }
}
