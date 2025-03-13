import { Module } from '@nestjs/common';
import { BorrowingTransactionService } from './borrowing-transaction.service';
import { BorrowingTransactionController } from './borrowing-transaction.controller';
import { UserModule } from '../user/user.module';
import { BookModule } from '../book/book.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BorrowingTransaction } from 'src/entities/borrowing-transaction.entity';

@Module({
  controllers: [BorrowingTransactionController],
  providers: [BorrowingTransactionService],
  imports: [UserModule, BookModule, TypeOrmModule.forFeature([BorrowingTransaction])],
  exports: [BorrowingTransactionService, TypeOrmModule],
})
export class BorrowingTransactionModule {}
