import { PickType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsDate, IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { BorrowingTransaction } from 'src/entities/borrowing-transaction.entity';

export class CreateBorrowingTransactionDto extends PickType(BorrowingTransaction, ['bookId', 'borrowedAt', 'dueDate']) {
  @Min(0, { message: 'không được bé hơn 0' })
  @IsInt({ message: 'phải là số nguyên lớn hơn 0' })
  @Type(() => Number)
  @IsNotEmpty({ message: 'userId không được để trống' })
  bookId: number;

  @IsDate({ message: 'không đúng định dạng ngày' })
  @Type(() => Date, {})
  @IsNotEmpty({ message: 'không được để trống' })
  borrowedAt: Date;

  @IsDate({ message: 'không đúng định dạng ngày' })
  @Type(() => Date, {})
  @IsNotEmpty({ message: 'không được để trống' })
  dueDate: Date;
}
