import { Module } from '@nestjs/common';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from '../../entities/book.entity';
import { FilesModule } from '../files/files.module';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  controllers: [BookController],
  providers: [BookService],
  exports: [BookService],
  imports: [
    FilesModule,
    HttpModule,
    TypeOrmModule.forFeature([Book]),
    MulterModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        dest: configService.get<string>('UPLOAD_FOLDER'),
      }),
      inject: [ConfigService],
    }),
    MulterModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        dest: configService.get<string>('COVER_IMAGES_FOLDER'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class BookModule {}
