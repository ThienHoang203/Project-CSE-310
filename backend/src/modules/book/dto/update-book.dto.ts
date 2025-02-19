import { PickType } from '@nestjs/mapped-types';
import CreateBookDto from './create-book.dto';
import { IsOptional } from 'class-validator';

export default class UpdateBookDto extends CreateBookDto {
  @IsOptional({ always: true })
  author: string;

  @IsOptional({ always: true })
  title: string;
}
