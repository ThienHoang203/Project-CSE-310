import { OmitType } from '@nestjs/mapped-types';
import { Exclude, Expose } from 'class-transformer';
import { User, UserMembershipLevel, UserRole, UserStatus } from 'src/entities/user.entity';

@Exclude()
export class UserInfoDto extends OmitType(User, ['password']) {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  username: string;

  @Expose()
  email: string;

  @Expose()
  phoneNumber: string;

  @Expose()
  birthDate: Date;

  @Expose()
  membershipLevel: UserMembershipLevel;

  @Expose()
  role: UserRole;

  @Expose()
  status: UserStatus;

  @Expose()
  created_at: Date;

  @Expose()
  updated_at: Date;
}
