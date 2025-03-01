import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export default class LoginDto {
  @MaxLength(50, { message: 'tên đăng nhập không được vượt quá 50 kí tự' })
  @IsString({ message: 'tên đăng nhập phải là chuỗi' })
  @IsNotEmpty({ message: 'tên đăng nhập không được để trống', always: true })
  username: string;

  @MinLength(8, { message: 'mật khẩu đăng nhập không được ít hơn 8 kí tự' })
  @IsString({ message: 'mật khẩu đăng nhập phải là chuỗi' })
  @IsNotEmpty({ message: 'mật khẩu đăng nhập không được để trống' })
  password: string;
}
