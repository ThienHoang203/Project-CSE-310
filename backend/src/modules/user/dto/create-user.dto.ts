import { PickType } from '@nestjs/mapped-types';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { User } from 'src/entities/user.entity';

export default class CreateUserDto extends PickType(User, [
  'birthDate',
  'email',
  'name',
  'password',
  'phoneNumber',
  'username',
]) {
  @MaxLength(50, { message: 'tên đăng nhập không được vượt quá 50 kí tự' })
  @IsString({ message: 'tên đăng nhập phải là chuỗi' })
  @IsNotEmpty({ message: 'tên đăng nhập không được để trống', always: true })
  username: string;

  @MinLength(8, { message: 'mật khẩu đăng nhập không được ít hơn 8 kí tự' })
  @IsString({ message: 'mật khẩu đăng nhập phải là chuỗi' })
  @IsNotEmpty({ message: 'mật khẩu đăng nhập không được để trống' })
  password: string;

  @MaxLength(50, { message: 'tên người dùng không được vượt quá 50 kí tự' })
  @IsString({ message: 'tên người dùng phải là chuỗi' })
  @IsOptional({ always: true })
  name: string;

  @MaxLength(200, { message: 'địa chỉ email không được vượt quá 200 kí tự' })
  @IsEmail({}, { message: 'địa chỉ email không đúng định dạng' })
  @IsString({ message: 'email phải là chuỗi' })
  @IsNotEmpty({ message: 'email không được để trống' })
  email: string;

  @IsPhoneNumber('VN', { message: 'số điện thoại không đúng định dạng' })
  @MaxLength(10, { message: 'số điện thoại không được vượt quá 10 chữ số' })
  @IsString({ message: 'số điện thoại phải là chuỗi' })
  @IsNotEmpty({ message: 'số điện thoại không được để trống' })
  phoneNumber: string;

  @IsDateString({}, { message: 'Ngày sinh phải có định dạng là YYYY-MM-DD' })
  @IsNotEmpty({ message: 'ngày sinh không được để trống' })
  birthDate: Date;
}
