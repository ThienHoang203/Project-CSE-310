import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { SortOrder } from 'src/entities/user.entity';

export default abstract class PaginationDto {
  @IsOptional()
  sortBy: unknown;

  @IsEnum(SortOrder, { message: `sortOrder phải là ${Object.values(SortOrder).join(' hoặc ')}.` })
  @IsOptional()
  sortOrder: SortOrder = SortOrder.ASC;

  @Min(1, { message: 'page phải lớn hơn hoặc bằng 1.' })
  @IsInt({ message: 'page phải là số nguyên.' })
  @Type(() => Number)
  @IsOptional()
  page: number;

  @Min(1, { message: 'limit phải lớn hơn hoặc bằng 1.' })
  @IsInt({ message: 'limit phải là số nguyên.' })
  @Type(() => Number)
  @IsOptional()
  limit: number;
}
