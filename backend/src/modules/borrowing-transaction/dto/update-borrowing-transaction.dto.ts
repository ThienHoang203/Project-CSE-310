import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateBorrowingTransactionDto } from './create-borrowing-transaction.dto';
import { IsDate, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { BorrowingTransactionStatus } from 'src/entities/borrowing-transaction.entity';

export class UpdateBorrowingTransactionDto extends PartialType(
  PickType(CreateBorrowingTransactionDto, ['borrowedAt', 'dueDate']),
) {
  @IsEnum(BorrowingTransactionStatus, {
    message: `status phải là ${Object.values(BorrowingTransactionStatus).join(' ,hoặc ')}`,
  })
  @IsOptional()
  status: BorrowingTransactionStatus;

  @IsDate({ message: 'không đúng định dạng ngày' })
  @Type(() => Date, {})
  @IsOptional()
  returnedAt: Date;
}
