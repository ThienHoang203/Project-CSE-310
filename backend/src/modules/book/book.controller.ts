import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { BookService } from './book.service';
import CreateBookDto from './dto/create-book.dto';
import UpdateBookDto from './dto/update-book.dto';

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get()
  getAllBook() {
    return this.bookService.findAll();
  }

  @Get('/:id')
  getBookById(@Param('id') id: string) {
    return this.bookService.findById(+id);
  }

  @Post()
  create(
    @Body()
    bookData: CreateBookDto,
  ) {
    if (!bookData) {
      throw new HttpException('empty data', HttpStatus.BAD_REQUEST);
    }
    return this.bookService.create(bookData);
  }

  @Patch('/:id')
  update(
    @Param('id') id: string,
    @Body()
    bookData: UpdateBookDto,
  ) {
    if (!bookData) {
      throw new HttpException('empty data', HttpStatus.BAD_REQUEST);
    }
    return this.bookService.update(+id, bookData);
  }

  @Delete('/:id')
  delete(@Param('id') id: string) {
    return this.bookService.delete(+id);
  }
}
