import { PartialType } from '@nestjs/mapped-types';
import { CreateBorrowingTransactionDto } from './create-borrowing-transaction.dto';

export class UpdateBorrowingTransactionDto extends PartialType(CreateBorrowingTransactionDto) {}
