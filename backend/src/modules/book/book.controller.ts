import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { BookService } from './book.service';
import UpdateBookDto from './dto/update-book.dto';
import { ConfigService } from '@nestjs/config';
import { UserRole } from 'src/entities/user.entity';
import { Roles } from 'src/decorator/roles.decorator';
import { join, parse } from 'path';
import { Response } from 'express';
import CreateBookDto from './dto/create-book.dto';
import * as fs from 'fs';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ebookExtType, fileFilter } from 'src/utils/fileFilter';
import { memoryStorage } from 'multer';
import { createFolderIfAbsent, saveFile } from 'src/utils/file';
import { BookFormat } from 'src/entities/book.entity';
import { Public } from 'src/decorator/public-route.decorator';
import { checkAndGetIntValue } from 'src/utils/checkType';

type FileNameObjectType = {
  ebookFilename: string;
  coverImageFilename: string;
};

@Roles(UserRole.ADMIN)
@Controller('book')
export class BookController {
  constructor(
    private readonly bookService: BookService,
    private readonly configService: ConfigService,
  ) {}

  //---------------------------ADMIN ROUTES---------------------------

  //create a new book
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'ebookFile', maxCount: 1 },
        { name: 'coverImageFile', maxCount: 1 },
      ],
      {
        storage: memoryStorage(),
        fileFilter: fileFilter,
        limits: {
          fields: 11,
          files: 2,
          fileSize: 60 * 1024 * 1024,
        },
      },
    ),
  )
  create(
    @UploadedFiles()
    {
      ebookFile,
      coverImageFile,
    }: { ebookFile?: Express.Multer.File[]; coverImageFile?: Express.Multer.File[] },
    @Body()
    bookData: CreateBookDto,
  ) {
    if (!bookData || Object.keys(bookData).length <= 0) throw new BadRequestException('empty data');
    //logic save  file
    const uploadFoldername = this.configService.get<string>('UPLOAD_FOLDER') || 'uploads';
    createFolderIfAbsent(uploadFoldername);

    if (bookData.format === BookFormat.PHYS && ebookFile)
      throw new BadRequestException('Không cho phép có bản điện tử trong sách có format là bản in');

    let { coverImageFilename, ebookFilename }: FileNameObjectType = {
      coverImageFilename: '',
      ebookFilename: '',
    };

    //create save ebook file and create ebook file name
    if (ebookFile && ebookFile.length > 0) {
      const uploadFolder = this.configService.get<string>('EBOOK_FOLDER') ?? 'uploads/ebooks';
      createFolderIfAbsent(uploadFolder);

      ebookFilename = saveFile(ebookFile[0], uploadFolder);
    }

    //create save cover image file and create cover image file name
    if (coverImageFile && coverImageFile.length > 0) {
      const uploadFolder =
        this.configService.get<string>('COVER_IMAGES_FOLDER') ?? 'uploads/covers';
      createFolderIfAbsent(uploadFolder);

      coverImageFilename = saveFile(coverImageFile[0], uploadFolder);
    }

    //send book object and save it into db
    return this.bookService.create({
      ...bookData,
      contentFilename: ebookFilename !== '' ? ebookFilename : undefined,
      coverImageFilename: coverImageFilename !== '' ? coverImageFilename : undefined,
    });
  }

  //update a book
  @Patch('/:bookId')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'ebookFile', maxCount: 1 },
        { name: 'coverImageFile', maxCount: 1 },
      ],
      {
        storage: memoryStorage(),
        fileFilter: fileFilter,
        limits: {
          fields: 11,
          files: 2,
          fileSize: 60 * 1024 * 1024,
        },
      },
    ),
  )
  update(
    @UploadedFiles()
    fileFields: { ebookFile?: Express.Multer.File[]; coverImageFile?: Express.Multer.File[] },
    @Body()
    bookData: UpdateBookDto,
    @Param('bookId') bookId: string,
  ) {
    const parsedIntID = checkAndGetIntValue(
      bookId,
      `bookId: ${bookId} phải là số nguyên`,
      0,
      `id(${bookId}) phải lớn hơn hoặc bằng 0`,
    );

    if (!bookData && !fileFields?.coverImageFile && !fileFields?.ebookFile)
      throw new BadRequestException('empty data');

    return this.bookService.update(
      parsedIntID,
      bookData,
      fileFields?.ebookFile,
      fileFields?.coverImageFile,
    );
  }

  //delete a book
  @Delete('/:bookId')
  delete(@Param('bookId') bookId: string) {
    const parsedIntID = checkAndGetIntValue(
      bookId,
      `id: ${bookId} phải là số`,
      0,
      `id(${bookId}) phải lớn hơn hoặc bằng 0`,
    );

    return this.bookService.delete(parsedIntID);
  }

  //---------------------------NORMAL USER ROUTES----------------------

  // view a file
  @Get('view/:filename')
  @Roles()
  async downloadEbookFile(@Param('filename') filename: string, @Res() res: Response) {
    let folder = '';

    const parsedFile = parse(filename);

    if (ebookExtType.includes(parsedFile.ext)) {
      folder = this.configService.get<string>('EBOOK_FOLDER') || '';
    } else {
      folder = this.configService.get<string>('COVER_IMAGES_FOLDER') || '';
    }

    const filePath = join(process.cwd(), folder, filename);

    if (!fs.existsSync(filePath)) throw new NotFoundException(`Not found file name ${filename}`);

    return res.sendFile(filePath);
  }

  @Get('/pagination')
  @Roles()
  @Public()
  paginateBySize(@Query('currentPage') currentPage: string, @Query('pageSize') pageSize: string) {
    const parsedIntCurrentPage = checkAndGetIntValue(
      currentPage,
      'currentPage phải là số nguyên!',
      1,
      'currentPage phải lớn hơn 0!',
    );
    const parsedIntPageSize = checkAndGetIntValue(
      currentPage,
      'currentPage phải là số nguyên!',
      1,
      'currentPage phải lớn hơn 0!',
    );

    return this.bookService.findBookBySize(parsedIntCurrentPage, parsedIntPageSize);
  }

  //get all books
  @Get()
  @Roles()
  @Public()
  getAllBook() {
    return this.bookService.findAll();
  }

  // get a book
  @Get('/:bookId')
  @Roles()
  @Public()
  getBookById(@Param('bookId') bookId: string) {
    console.log('Hello');
    const parsedIntID = checkAndGetIntValue(
      bookId,
      `bookId: ${bookId} phải là số`,
      0,
      `bookId(${bookId}) phải lớn hơn hoặc bằng 0`,
    );

    return this.bookService.findById(parsedIntID);
  }
}
