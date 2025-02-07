import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from 'src/entities/book.entity';
import { Repository, UpdateResult } from 'typeorm';
import UpdateBookDto from './dto/update-book.dto';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}

  async findById(id: number): Promise<Book | null> {
    const book: Book | null = await this.bookRepository.findOneBy({ id });
    if (!book) {
      throw new HttpException('not found', HttpStatus.NOT_FOUND);
    }
    return book;
  }

  findAll(): Promise<Book[]> {
    return this.bookRepository.find();
  }

  create(bookData: Book): Promise<Book> {
    const book = this.bookRepository.create(bookData);
    return this.bookRepository.save(book);
  }

  async update(id: number, bookData: UpdateBookDto): Promise<Book | null> {
    const book: Book | null = await this.bookRepository.findOneBy({ id });
    if (!book) {
      throw new HttpException('not found', HttpStatus.NOT_FOUND);
    }
    const result: UpdateResult = await this.bookRepository.update(id, bookData);
    if (result.affected !== 1) {
      throw new HttpException('unsuccessfully updated', HttpStatus.BAD_REQUEST);
    }
    return this.bookRepository.findOneBy({ id });
  }

  delete(id: number) {
    const result = this.bookRepository.delete(id);
    return result;
  }
}
