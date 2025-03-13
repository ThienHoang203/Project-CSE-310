import { Module } from '@nestjs/common';
import { RatingService } from './rating.service';
import { RatingController } from './rating.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { BookModule } from '../book/book.module';
import { Rating } from 'src/entities/rating.entity';

@Module({
  controllers: [RatingController],
  providers: [RatingService],
  imports: [UserModule, BookModule, TypeOrmModule.forFeature([Rating])],
  exports: [RatingService, TypeOrmModule],
})
export class RatingModule {}
