import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class AcceptReservationDto {
  @Min(0, { message: 'Không được nhỏ hơn 0!' })
  @IsInt({ message: 'Phải là số nguyên!' })
  @Type(() => Number)
  @IsNotEmpty({ message: 'Không được để trống!' })
  reservationId: number;

  @Min(0, { message: 'Không được nhỏ hơn 0!' })
  @IsInt({ message: 'Phải là số nguyên!' })
  @Type(() => Number)
  @IsNotEmpty({ message: 'Không được để trống!' })
  userId: number;
}
