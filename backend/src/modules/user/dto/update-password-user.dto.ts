import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export default class UpdatePasswordUserDto {
  @MinLength(8, { message: 'mật khẩu cũ không được ít hơn 8 kí tự' })
  @IsString({ message: 'mật khẩu cũ phải là chuỗi' })
  @IsNotEmpty({ message: 'mật khẩu cũ không được để trống' })
  oldPassword: string;

  @MinLength(8, { message: 'mật khẩu mới không được ít hơn 8 kí tự' })
  @IsString({ message: 'mật khẩu mới phải là chuỗi' })
  @IsNotEmpty({ message: 'mật khẩu mới không được để trống' })
  newPassword: string;
}
