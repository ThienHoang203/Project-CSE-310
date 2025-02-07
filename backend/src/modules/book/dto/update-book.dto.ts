import { PickType } from '@nestjs/mapped-types';
import CreateBookDto from './create-book.dto';
import { IsOptional } from 'class-validator';

export default class UpdateBookDto extends PickType(CreateBookDto, [
  'author',
  'coverImageURL',
  'description',
  'gerne',
  'title',
]) {
  @IsOptional({ always: true })
  title: string;
}
