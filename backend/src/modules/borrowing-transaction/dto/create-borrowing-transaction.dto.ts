import { PickType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumberString, IsOptional } from 'class-validator';
import { BorrowingTransaction } from 'src/entities/borrowing-transaction.entity';

export class CreateBorrowingTransactionDto extends PickType(BorrowingTransaction, [
  'bookId',
  'userId',
  'borrowedAt',
  'dueDate',
]) {
  @IsNumberString({}, { message: (validationArguments) => `${validationArguments.property} phải là số` })
  @IsNotEmpty({ message: 'userId không được để trống' })
  userId: number;

  @IsNumberString({}, { message: (validationArguments) => `${validationArguments.property} phải là số` })
  @IsNotEmpty({ message: 'userId không được để trống' })
  bookId: number;

  @IsDate({ message: (validationArguments) => `${validationArguments.property} không đúng định dạng ngày` })
  @Type(() => Date, {})
  @IsNotEmpty({ message: 'userId không được để trống' })
  borrowedAt: Date;

  @IsDate({ message: (validationArguments) => `${validationArguments.property} không đúng định dạng ngày` })
  @Type(() => Date, {})
  @IsOptional()
  dueDate: Date;
}
