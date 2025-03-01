import { PickType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import CreateUserDto from 'src/modules/user/dto/create-user.dto';

export default class ResetPasswordDto extends PickType(CreateUserDto, ['password']) {
  @IsUUID('4', { message: 'Invalid UUID format' })
  @IsNotEmpty({ message: 'activateCode không được để trống', always: true })
  activateCode: string;
}
