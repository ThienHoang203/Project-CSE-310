import { IsEnum, IsOptional } from 'class-validator';
import PaginationDto from 'src/common/pagination.dto';
import { BookSortType } from 'src/entities/book.entity';

export default class PaginationBookDto extends PaginationDto {
  @IsEnum(BookSortType, {
    message: `sortBy phải là ${Object.values(BookSortType).join(' hoặc ')}.`,
  })
  @IsOptional()
  sortBy: BookSortType = BookSortType.CREATED_AT;
}
