import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Book, BookFormat, BookSortType } from 'src/entities/book.entity';
import { Like, Repository } from 'typeorm';
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
import PaginationBookDto from './dto/pagination-book.dto';
import SearchBookDto from './dto/search-book.dto';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    private readonly configService: ConfigService,
  ) {}

  async hasBookId(bookId: number): Promise<true> {
    const has = await this.bookRepository.existsBy({ id: bookId });
    if (!has) throw new NotFoundException(`BookId: ${bookId} không tồn tại!`);
    return true;
  }

  async findById(id: number): Promise<Book> {
    const book: Book | null = await this.bookRepository.findOneBy({ id });
    if (!book) throw new NotFoundException(`BookId: ${id} doesn't exist!`);

    return book;
  }

  async paginateUsersByCriteria({
    limit,
    page,
    sortBy,
    sortOrder,
  }: PaginationBookDto): Promise<{ totalBooks: number; books: Book[] }> {
    let books: Book[];
    if (!page || !limit) books = await this.bookRepository.find({ order: { [sortBy]: sortOrder } });
    else
      books = await this.bookRepository.find({
        skip: (page - 1) * limit,
        take: limit,
        order: { [sortBy]: sortOrder },
      });
    return { totalBooks: books.length, books };
  }

  async searchBooks({
    author,
    format,
    gerne,
    publishedDate,
    stock,
    title,
    version,
  }: SearchBookDto): Promise<{ totalBooks: number; users: Book[] }> {
    let books: Book[];
    let where: any = {};
    if (title) where.title = Like(`%${title}%`);
    if (author) where.author = Like(`%${author}%`);
    if (format) where.format = format;
    if (gerne) where.gerne = gerne;
    if (publishedDate) where.publishedDate = publishedDate;
    if (stock) where.stock = stock;
    if (version) where.version = version;

    books = await this.bookRepository.find({
      select: ['id', 'title', 'author', 'gerne', 'format', 'publishedDate', 'version', 'stock'],
      where: where,
    });
    return {
      totalBooks: books.length,
      users: books,
    };
  }

  // async findAll(): Promise<{ totalBooks: number; books: Book[] }> {
  //   const [books, count] = await this.bookRepository.findAndCount();
  //   return { totalBooks: count, books };
  // }

  async create(
    bookData: CreateBookDto & { coverImageFilename?: string; contentFilename?: string },
  ): Promise<{ id: number }> {
    const book = this.bookRepository.create(bookData);

    if (book.format === BookFormat.DIG) {
      if (book.contentFilename) {
        book.stock = 1;
      } else book.stock = 0;
    }

    const result = await this.bookRepository.insert(book);

    if (result.identifiers.length === 0)
      throw new InternalServerErrorException('Thêm sách mới thất bại!');

    return { id: result.identifiers[0].id };
  }

  async update(
    id: number,
    bookData: UpdateBookDto,
    ebookFile?: Express.Multer.File[],
    coverImageFile?: Express.Multer.File[],
  ): Promise<{ id: number }> {
    const book: Book = await this.findById(id);

    const { contentFilename, coverImageFilename, format } = book;

    if (format === BookFormat.PHYS && ebookFile)
      throw new BadRequestException('Không cho phép có bản điện tử trong sách có format là bản in');

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

    const result = await this.bookRepository.update({ id }, book);

    if (!result.affected || result.affected === 0)
      throw new InternalServerErrorException('Cập nhật sách thất bại!');
    return { id };
  }

  async updateFile(id: number, category: string, filename: string): Promise<any> {
    const attributeName = folderUploadConvertBookAttribute[`${category}`];

    if (!attributeName)
      throw new BadRequestException(
        `Category phải là ${Object.values(UploadCategory).join(' ,hoặc ')}`,
      );

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
