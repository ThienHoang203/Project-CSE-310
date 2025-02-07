import { Module } from '@nestjs/common';
import { BookVersionService } from './book-version.service';
import { BookVersionController } from './book-version.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookVersion } from '../../entities/book-version.entity';

@Module({
  controllers: [BookVersionController],
  providers: [BookVersionService],
  imports: [TypeOrmModule.forFeature([BookVersion])],
})
export class BookVersionModule {}
