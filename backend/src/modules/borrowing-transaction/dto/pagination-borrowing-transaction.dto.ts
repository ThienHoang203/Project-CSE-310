import { IsEnum, IsOptional } from 'class-validator';
import PaginationDto from 'src/common/pagination.dto';
import { BorrowingTransactionSortType } from 'src/entities/borrowing-transaction.entity';

export default class PaginationBorrowingTransactionDto extends PaginationDto {
  @IsEnum(BorrowingTransactionSortType, {
    message: `sortBy phải là ${Object.values(BorrowingTransactionSortType).join(' hoặc ')}.`,
  })
  @IsOptional()
  sortBy: BorrowingTransactionSortType = BorrowingTransactionSortType.BORROWED_AT;
}
