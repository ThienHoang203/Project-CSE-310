import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { BookModule } from './modules/book/book.module';
import { Book } from './entities/book.entity';
import { BookVersionModule } from './modules/book-version/book-version.module';
import { BookVersion } from './entities/book-version.entity';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { RefeshToken } from './entities/refesh-token.entity';

@Module({
  imports: [
    //***********Error code block*/
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: async (configService: ConfigService) => ({
    //     type: 'mariadb',
    //     host: configService.get<string>('DB_HOST'),
    //     port: configService.get<number>('DB_PORT'),
    //     username: configService.get<string>('DB_USERNAME'),
    //     password: configService.get<string>('DB_PASSWORD'),
    //     database: configService.get<string>('DB_NAME'),
    //     entities: [User, Book, BookVersion],
    //     synchronize: true,
    //     logging: true,
    //   }),
    // }),

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'book_management2',
      entities: [User, Book, BookVersion, RefeshToken],
      synchronize: true,
      logging: true,
      migrations: [],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule,
    BookModule,
    BookVersionModule,
    AuthModule,
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
