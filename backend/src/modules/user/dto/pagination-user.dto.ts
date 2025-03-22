import { IsEnum, IsOptional } from 'class-validator';
import PaginationDto from 'src/common/pagination.dto';
import { UserSortType } from 'src/entities/user.entity';

export default class PaginationUserDto extends PaginationDto {
  @IsEnum(UserSortType, {
    message: `sortBy phải là ${Object.values(UserSortType).join(' hoặc ')}.`,
  })
  @IsOptional()
  sortBy: UserSortType = UserSortType.CREATED_AT;
}
