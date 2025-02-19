import { Module } from '@nestjs/common';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from '../../entities/book.entity';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { FilesModule } from '../files/files.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [BookController],
  providers: [BookService],
  exports: [BookService],
  imports: [FilesModule, HttpModule, TypeOrmModule.forFeature([Book])],
})
export class BookModule {}
