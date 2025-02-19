import { Module } from '@nestjs/common';
import { BorrowingTransactionService } from './borrowing-transaction.service';
import { BorrowingTransactionController } from './borrowing-transaction.controller';

@Module({
  controllers: [BorrowingTransactionController],
  providers: [BorrowingTransactionService],
})
export class BorrowingTransactionModule {}
