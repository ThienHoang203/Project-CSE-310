import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { Reservation } from 'src/entities/reservation.entity';

export class CreateReservationDto {
  @Min(0, { message: 'Không dược bé hơn 0!' })
  @IsInt({ message: 'Phải là số nguyên!' })
  @Type(() => Number)
  @IsNotEmpty({ message: 'Không được để trống!' })
  bookId: number;
}
