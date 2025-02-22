import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
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
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';

@Roles(UserRole.ADMIN)
@Controller('book')
export class BookController {
  constructor(
    private readonly bookService: BookService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  getAllBook() {
    return this.bookService.findAll();
  }

  @Get('/:id')
  getBookById(@Param('id') id: string) {
    return this.bookService.findById(BigInt(id));
  }

  @Roles()
  @Get('/view/ebook/:filename')
  async downloadEbookFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(
      process.cwd(),
      this.configService.get<string>('EBOOK_FOLDER') || 'uploads/ebooks',
      filename,
    );
    if (!fs.existsSync(filePath)) throw new NotFoundException(`Can not found file name ${filename}`);
    return res.sendFile(filePath);
  }

  @Roles()
  @Get('/view/cover/:filename')
  async downloadCoverImageFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(
      process.cwd(),
      this.configService.get<string>('COVER_IMAGES_FOLDER') || 'uploads/ebooks',
      filename,
    );
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
        storage: diskStorage({
          destination: (req, file, cb) => {
            console.log(join(process.cwd(), 'uploads', 'covers'));
            if (file.mimetype.startsWith('image/')) {
              cb(null, join(process.cwd(), 'uploads', 'covers'));
            } else if (file.mimetype.startsWith('application/pdf')) {
              cb(null, join(process.cwd(), 'uploads', 'ebooks'));
            }
          },
          filename(req, file, cb) {
            const parsedFile = parse(file.originalname);
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            cb(null, `${parsedFile.name}-${uniqueSuffix}${parsedFile.ext}`);
          },
        }),
        fileFilter: (req, file, callback) => {
          if (file.mimetype.endsWith('/jpeg') || file.mimetype.endsWith('/png')) {
            const maxMBs = 2;
            const maxBytes = maxMBs * 1024 * 1024;
            if (file.size > maxBytes)
              callback(new BadRequestException(`File ảnh không được lớn hơn ${maxMBs}MB`), false);
            callback(null, true);
          } else if (file.mimetype.endsWith('/pdf')) {
            const maxMBs = 60;
            const maxBytes = maxMBs * 1024 * 1024;
            if (file.size > maxBytes)
              callback(new BadRequestException(`File ebook không được lớn hơn ${maxMBs}MB`), false);
            callback(null, true);
          } else {
            callback(new BadRequestException('File không đúng định dạng!'), false);
          }
        },
        limits: {
          fields: 11,
          files: 2,
        },
      },
    ),
  )
  async create(
    @UploadedFiles()
    {
      ebookFile,
      coverImageFile,
    }: { ebookFile?: Express.Multer.File[]; coverImageFile?: Express.Multer.File[] },
    @Body()
    bookData: CreateBookDto,
  ): Promise<import('d:/STUDY/CSE310/Project-CSE-310/backend/src/entities/book.entity').Book> {
    if (!bookData || Object.keys.length <= 0) {
      throw new HttpException('empty data', HttpStatus.BAD_REQUEST);
    }
    const { author, description, format, gerne, publishedDate, status, stock, title, version } = bookData;

    return this.bookService.create({
      author,
      title,
      format,
      description,
      gerne,
      publishedDate,
      status,
      stock,
      version,
      contentFileURL: ebookFile ? ebookFile[0].filename : undefined,
      coverImageFileURL: coverImageFile ? coverImageFile[0].filename : undefined,
    });
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
    return this.bookService.update(BigInt(id), bookData);
  }

  @Delete('/:id')
  delete(@Param('id') id: string) {
    return this.bookService.delete(BigInt(id));
  }
}
