import { PickType } from '@nestjs/mapped-types';
import CreateUserDto from './create-user.dto';
import { IsOptional } from 'class-validator';

export default class UpdateUserDto extends PickType(CreateUserDto, [
  'email',
  'membershipLevel',
  'name',
  'password',
  'phoneNumber',
  'role',
  'status',
]) {
  // @IsOptional({ always: true })
  // password: string;
  // @IsOptional({ always: true })
  // phoneNumber: string;
}
