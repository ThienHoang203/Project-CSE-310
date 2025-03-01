import { Module } from '@nestjs/common';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from '../../entities/book.entity';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  controllers: [BookController],
  providers: [BookService],
  exports: [BookService, TypeOrmModule],
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Book]),
    MulterModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        dest: configService.get<string>('UPLOAD_FOLDER'),
        limits: {},
      }),
      inject: [ConfigService],
    }),
  ],
})
export class BookModule {}
