import { IsEnum, IsOptional } from 'class-validator';
import { IsValidBirthDate } from 'src/decorator/is-valid-birth-date.decorator';
import { UserMembershipLevel, UserRole, UserStatus } from 'src/entities/user.entity';

export default class SearchUserDto {
  @IsOptional()
  username: string;

  @IsOptional()
  email: string;

  @IsOptional()
  phoneNumber: string;

  @IsOptional()
  name: string;

  @IsValidBirthDate()
  @IsOptional()
  birthDate: Date;

  @IsEnum(UserRole, { message: `status phải là ${Object.values(UserRole).join(' hoặc ')}.` })
  @IsOptional()
  role: UserRole;

  @IsEnum(UserStatus, { message: `status phải là ${Object.values(UserStatus).join(' hoặc ')}.` })
  @IsOptional()
  status: UserStatus;

  @IsEnum(UserMembershipLevel, {
    message: `status phải là ${Object.values(UserMembershipLevel).join(' hoặc ')}.`,
  })
  @IsOptional()
  membershipLevel: UserMembershipLevel;
}
