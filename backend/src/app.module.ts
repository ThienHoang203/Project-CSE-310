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
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule,
    BookModule,
    AuthModule,
    WishlistModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer.apply(LoggingMiddleware).forRoutes({
  //     path: '/book',
  //     method: RequestMethod.ALL,
  //   });
  // }
}
