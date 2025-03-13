import { Module } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from 'src/entities/reservation.entity';
import { UserModule } from '../user/user.module';
import { BookModule } from '../book/book.module';
import { BorrowingTransactionModule } from '../borrowing-transaction/borrowing-transaction.module';

@Module({
  controllers: [ReservationController],
  providers: [ReservationService],
  imports: [
    UserModule,
    BookModule,
    BorrowingTransactionModule,
    TypeOrmModule.forFeature([Reservation]),
  ],
  exports: [ReservationService, TypeOrmModule],
})
export class ReservationModule {}
