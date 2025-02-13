import {
  IsDateString,
  IsDecimal,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  isURL,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Book, BookFormat, BookGerne, BookStatus } from 'src/entities/book.entity';

export default class CreateBookDto extends Book {
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

  @MaxLength(300, { message: 'đường dẫn đến ảnh bìa sách không được vượt quá 300 kí tự' })
  @IsString({ message: 'đường dẫn đến ảnh bìa sách phải là chuỗi' })
  @IsOptional({ always: true })
  coverImageURL: string;

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

  @IsUrl({}, { message: 'thể loại sách không đúng định dạng' })
  @IsOptional({ always: true })
  fileURL: string;

  @IsDecimal({}, { message: 'phiên bản sách không đúng định dạng' })
  @IsOptional({ always: true })
  version: number;
}
