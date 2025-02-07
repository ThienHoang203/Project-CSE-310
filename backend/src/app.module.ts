import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookService } from './modules/book/book.service';
import { User } from './entities/user.entity';
import { BookModule } from './modules/book/book.module';
import { Book } from './entities/book.entity';
import { BookVersionModule } from './modules/book-version/book-version.module';
import { BookVersion } from './entities/book-version.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'book_management2',
      synchronize: true,
      logging: true,
      entities: [User, Book, BookVersion],
      subscribers: [],
      migrations: [],
    }),
    UserModule,
    BookModule,
    BookVersionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
