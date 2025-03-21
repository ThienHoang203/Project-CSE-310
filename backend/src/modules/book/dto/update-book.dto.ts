import { PickType } from '@nestjs/mapped-types';
import CreateBookDto from './create-book.dto';
import { IsOptional } from 'class-validator';

export default class UpdateBookDto extends PickType(CreateBookDto, [
  'author',
  'description',
  'gerne',
  'publishedDate',
  'stock',
  'title',
  'version',
]) {
  @IsOptional({ always: true })
  author: string;

  @IsOptional({ always: true })
  title: string;
}
