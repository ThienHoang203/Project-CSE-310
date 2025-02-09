import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Book, BookGerne } from 'src/entities/book.entity';

export default class CreateBookDto extends Book {
  @MaxLength(50, { message: 'tên tác giả không được vượt quá 50 kí tự' })
  @IsString({ message: 'tên tác giả phải là chuỗi' })
  @IsOptional({ always: true })
  author: string;

  @MaxLength(200, { message: 'tiêu đề sách không được vượt quá 200 kí tự' })
  @IsString({ message: 'tiêu đề sách phải là chuỗi' })
  @IsNotEmpty({ message: 'tiêu đề sách không được để trống' })
  title: string;

  @IsEnum(BookGerne)
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
}
