import { PickType } from '@nestjs/mapped-types';
import CreateUserDto from 'src/modules/user/dto/create-user.dto';

export default class LoginDto extends PickType(CreateUserDto, ['username', 'password']) {}
