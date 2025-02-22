import { PickType } from '@nestjs/mapped-types';
import { CreateAdminDto } from './create-admin.dto';
import { IsOptional } from 'class-validator';

export class UpdateAdminDto extends PickType(CreateAdminDto, ['email', 'name', 'phoneNumber', 'birthDate']) {
  @IsOptional()
  phoneNumber: string;

  @IsOptional()
  birthDate: Date;
}
