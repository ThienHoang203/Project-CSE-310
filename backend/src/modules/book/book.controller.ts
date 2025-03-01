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
import { getIntValue } from 'src/utils/checkType';

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

  @Get()
  @Roles()
  @Public()
  getAllBook() {
    return this.bookService.findAll();
  }

  @Get('/:id')
  @Roles()
  @Public()
  getBookById(@Param('id') id: string) {
    const parsedIntID = getIntValue(id);

    if (!parsedIntID || parsedIntID < 0) throw new BadRequestException(`id: ${id} phải là số nguyên dương!`);

    return this.bookService.findById(parsedIntID);
  }

  @Get('/view/:filename')
  @Roles()
  @Public()
  async downloadEbookFile(@Param('filename') filename: string, @Res() res: Response) {
    let folder = '';

    const parsedFile = parse(filename);

    if (ebookExtType.includes(parsedFile.ext)) {
      folder = this.configService.get<string>('EBOOK_FOLDER') || '';
    } else {
      folder = this.configService.get<string>('COVER_IMAGES_FOLDER') || '';
    }

    const filePath = join(process.cwd(), folder, filename);

    if (!fs.existsSync(filePath)) throw new NotFoundException(`Can not found file name ${filename}`);

    return res.sendFile(filePath);
  }

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
      const uploadFolder = this.configService.get<string>('COVER_IMAGES_FOLDER') ?? 'uploads/covers';
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

  // @Patch()
  // @UseInterceptors(
  //   FileFieldsInterceptor(
  //     [
  //       { name: 'ebookFile', maxCount: 1 },
  //       { name: 'coverImageFile', maxCount: 1 },
  //     ],
  //     {
  //       storage: memoryStorage(),
  //       fileFilter: fileFilter,
  //       limits: {
  //         fields: 11,
  //         files: 2,
  //         fileSize: 60 * 1024 * 1024,
  //       },
  //     },
  //   ),
  // )
  // updateFile(
  //   @UploadedFiles()
  //   {
  //     ebookFile,
  //     coverImageFile,
  //   }: { ebookFile?: Express.Multer.File[]; coverImageFile?: Express.Multer.File[] },
  //   @Query('id') id: string,
  //   @Query('category') category: string,
  // ) {
  //   const parsedIntID = getIntValue(id);

  //   if (!parsedIntID || parsedIntID < 0) throw new BadRequestException(`id: ${id} phải là số nguyên dương!`);

  //   if (!category) throw new BadRequestException('Tham số thiếu category!');

  //   const uploadFoldername = this.configService.get<string>('UPLOAD_FOLDER') || 'uploads';

  //   return this.bookService.updateFile(parsedIntID, category);
  // }

  @Patch('/:id')
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
    @Param('id') id: string,
  ) {
    const parsedIntID = getIntValue(id);

    console.log('coverImageFile:::', parsedIntID);

    if (!parsedIntID || parsedIntID < 0) throw new BadRequestException(`id: ${id} phải là số nguyên dương!`);
    console.log('bookdata: ', bookData);

    if (!bookData && !fileFields?.coverImageFile && !fileFields?.ebookFile)
      throw new BadRequestException('empty data');

    return this.bookService.update(parsedIntID, bookData, fileFields?.ebookFile, fileFields?.coverImageFile);
  }

  @Delete('/:id')
  delete(@Param('id') id: string) {
    const parsedIntID = getIntValue(id);

    if (!parsedIntID || parsedIntID < 0) throw new BadRequestException(`id: ${id} phải là số nguyên dương!`);

    return this.bookService.delete(parsedIntID);
  }
}
