import { OmitType } from '@nestjs/mapped-types';
import { BorrowingTransaction } from 'src/entities/borrowing-transaction.entity';

export class CreateBorrowingTransactionDto extends OmitType(BorrowingTransaction, ['created_at']) {}
