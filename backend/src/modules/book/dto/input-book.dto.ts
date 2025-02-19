import { PickType } from '@nestjs/mapped-types';
import {
  IsDateString,
  IsDecimal,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { Book, BookFormat, BookGerne, BookStatus } from 'src/entities/book.entity';

export default class InputBookDto extends PickType(Book, [
  'author',
  'description',
  'format',
  'gerne',
  'publishedDate',
  'status',
  'stock',
  'title',
  'version',
]) {
  @MaxLength(50, { message: 'tên tác giả không được vượt quá 50 kí tự' })
  @IsString({ message: 'tên tác giả phải là chuỗi' })
  @IsNotEmpty({ message: 'tên tác giả không được để trống' })
  author: string;

  @MaxLength(200, { message: 'tiêu đề sách không được vượt quá 200 kí tự' })
  @IsString({ message: 'tiêu đề sách phải là chuỗi' })
  @IsNotEmpty({ message: 'tiêu đề sách không được để trống' })
  title: string;

  @IsEnum(BookGerne, { message: 'thể loại sách không đúng định dạng' })
  @IsOptional({ always: true })
  gerne: BookGerne;

  @MaxLength(1000, { message: 'mô tả sách không được vượt quá 1000 kí tự' })
  @IsString({ message: 'mô tả sách phải là chuỗi' })
  @IsOptional({ always: true })
  description: string;

  @IsEnum(BookStatus, { message: 'trạng thái sách không đúng định dạng' })
  status: BookStatus;

  @IsEnum(BookFormat, { message: 'format sách không đúng định dạng' })
  @IsNotEmpty({ message: 'format sách không được để trống' })
  format: BookFormat;

  @IsNumber({}, { message: 'số lượng sách không đúng định dạng' })
  @IsOptional({ always: true })
  stock: number;

  @IsDateString({}, { message: 'ngày xuất bản sách không đúng định dạng' })
  @IsOptional({ always: true })
  publishedDate: Date;

  @IsOptional({ always: true })
  contentFile: File;

  @IsOptional({ always: true })
  coverImageFile: File;

  @IsDecimal({}, { message: 'phiên bản sách không đúng định dạng' })
  @IsOptional({ always: true })
  version: number;
}
