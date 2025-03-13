import { PickType } from '@nestjs/mapped-types';
import CreateUserDto from './create-user.dto';
import { IsOptional } from 'class-validator';

export default class UpdateUserDto extends PickType(CreateUserDto, ['email', 'name', 'phoneNumber', 'birthDate']) {
  @IsOptional()
  email: string;

  @IsOptional()
  phoneNumber: string;

  @IsOptional()
  birthDate: Date;
}
