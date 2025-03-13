import { PickType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { Rating } from 'src/entities/rating.entity';

export class CreateRatingDto extends PickType(Rating, ['rating', 'bookId', 'comment']) {
  @Min(0, { message: 'Số lượng sách không được bé hơn 0' })
  @IsInt({ message: 'phải là số nguyên' })
  @Type(() => Number)
  @IsNotEmpty({ message: 'userId không được để trống' })
  bookId: number;

  @Max(5, { message: 'không được lớn hơn 5' })
  @Min(1, { message: 'Rating không được bé hơn 1' })
  @IsInt({ message: 'phải là số nguyên' })
  @Type(() => Number)
  @IsNotEmpty({ message: 'không được để trống' })
  rating: number;

  @IsString({ message: 'phải là chuỗi' })
  @IsOptional()
  comment: string;
}
