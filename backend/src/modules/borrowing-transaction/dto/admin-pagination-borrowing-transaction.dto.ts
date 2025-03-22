import { IsEnum, IsOptional } from 'class-validator';
import PaginationDto from 'src/common/pagination.dto';
import { AdminBorrowingTransactionSortType } from 'src/entities/borrowing-transaction.entity';

export default class AdminPaginationBorrowingTransactionDto extends PaginationDto {
  @IsEnum(AdminBorrowingTransactionSortType, {
    message: `sortBy phải là ${Object.values(AdminBorrowingTransactionSortType).join(' hoặc ')}.`,
  })
  @IsOptional()
  sortBy: AdminBorrowingTransactionSortType = AdminBorrowingTransactionSortType.BORROWED_AT;
}
