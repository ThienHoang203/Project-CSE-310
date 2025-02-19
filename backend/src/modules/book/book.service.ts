import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from 'src/entities/book.entity';
import { Repository } from 'typeorm';
import UpdateBookDto from './dto/update-book.dto';
import CreateBookDto from './dto/create-book.dto';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}

  async findById(id: bigint): Promise<Book | null> {
    const book: Book | null = await this.bookRepository.findOneBy({ id });
    if (!book) {
      throw new HttpException('not found', HttpStatus.NOT_FOUND);
    }
    return book;
  }

  findAll(): Promise<Book[]> {
    return this.bookRepository.find();
  }

  create(bookData: CreateBookDto): Promise<Book> {
    const book = this.bookRepository.create(bookData);
    return this.bookRepository.save(book);
  }

  async update(id: bigint, bookData: UpdateBookDto): Promise<Book | null> {
    const book: Book | null = await this.bookRepository.findOneBy({ id });
    if (!book) {
      throw new HttpException('not found', HttpStatus.NOT_FOUND);
    }
    const result: Book = await this.bookRepository.save(bookData);
    return result;
  }

  async delete(id: bigint) {
    const book: Book | null = await this.bookRepository.findOneBy({ id });
    if (!book) throw new NotFoundException();
    const result = this.bookRepository.remove(book);
    return result;
  }
}
