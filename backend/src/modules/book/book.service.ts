import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Book, BookFormat, BookStatus } from 'src/entities/book.entity';
import { Repository } from 'typeorm';
import UpdateBookDto from './dto/update-book.dto';
import CreateBookDto from './dto/create-book.dto';
import {
  createFolderIfAbsent,
  folderUploadConvertBookAttribute,
  removeFile,
  replaceFile,
  UploadCategory,
} from 'src/utils/file';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    private readonly configService: ConfigService,
  ) {}

  async findById(id: number): Promise<Book> {
    const book: Book | null = await this.bookRepository.findOneBy({ id });
    if (!book) throw new NotFoundException(`BookId: ${id} doesn't exist!`);

    return book;
  }

  findAll(): Promise<Book[]> {
    return this.bookRepository.find();
  }

  async create(
    bookData: CreateBookDto & { coverImageFilename?: string; contentFilename?: string },
  ): Promise<Book> {
    const book = this.bookRepository.create(bookData);

    if (book.contentFilename && book.format === BookFormat.DIG) {
      book.stock = 1;
    }

    if (book.stock > 0) {
      book.status = BookStatus.AVAIL;
    }

    return this.bookRepository.save(book);
  }

  async update(
    id: number,
    bookData: UpdateBookDto,
    ebookFile?: Express.Multer.File[],
    coverImageFile?: Express.Multer.File[],
  ): Promise<Book | null> {
    const book: Book = await this.findById(id);

    const { contentFilename, coverImageFilename } = book;

    const uploadFolder = this.configService.get<string>('UPLOAD_FOLDER') || 'uploads';

    createFolderIfAbsent(uploadFolder);

    if (ebookFile && ebookFile.length > 0) {
      const ebookFolder = this.configService.get<string>('EBOOK_FOLDER') || 'uploads/ebooks';

      createFolderIfAbsent(ebookFolder);

      const newFilename = replaceFile(ebookFile[0], ebookFolder, contentFilename);

      book.contentFilename = newFilename;
    }

    if (coverImageFile && coverImageFile.length > 0) {
      const coverFolder = this.configService.get<string>('COVER_IMAGES_FOLDER') || 'uploads/covers';

      createFolderIfAbsent(coverFolder);

      const newFilename = replaceFile(coverImageFile[0], coverFolder, coverImageFilename);
      console.log(newFilename);
      book.coverImageFilename = newFilename;
    }

    for (const [key, value] of Object.entries(bookData)) {
      if (value) book[key] = value;
    }

    const result: Book = await this.bookRepository.save(book);
    return result;
  }

  async updateFile(id: number, category: string, filename: string): Promise<any> {
    const attributeName = folderUploadConvertBookAttribute[`${category}`];

    if (!attributeName)
      throw new BadRequestException(`Category phải là ${Object.values(UploadCategory).join(' ,hoặc ')}`);

    const result = this.bookRepository.update({ id }, { [`${attributeName}`]: filename });

    return result;
  }

  async delete(id: number): Promise<{
    book: Book;
    isRemovedCoverImageFile: boolean | undefined;
    isRemovedContentFile: boolean | undefined;
  }> {
    const book: Book = await this.findById(id);

    const result = await this.bookRepository.remove(book);

    let isRemovedContentFile: boolean = false;

    if (book.contentFilename && book.contentFilename !== '') {
      isRemovedContentFile = await removeFile(
        book.contentFilename,
        this.configService.get<string>('EBOOK_FOLDER') || 'uploads/ebooks',
      );
    }

    let isRemovedCoverImageFile: boolean = false;
    if (book?.coverImageFilename && book?.coverImageFilename !== '') {
      isRemovedCoverImageFile = await removeFile(
        book.coverImageFilename,
        this.configService.get<string>('COVER_IMAGES_FOLDER') || 'uploads/covers',
      );
    }

    return {
      book: result,
      isRemovedContentFile,
      isRemovedCoverImageFile,
    };
  }
}
