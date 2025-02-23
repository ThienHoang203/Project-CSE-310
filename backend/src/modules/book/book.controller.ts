import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
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
import path, { join, parse } from 'path';
import { Response } from 'express';
import CreateBookDto from './dto/create-book.dto';
import * as fs from 'fs';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { coverImageMimeFileTypes, ebookMimeFileTypes } from 'src/utils/fileFilter';
import { memoryStorage } from 'multer';
import { saveFile } from 'src/utils/saveFile';

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
  getAllBook() {
    return this.bookService.findAll();
  }

  @Get('/:id')
  getBookById(@Param('id') id: string) {
    return this.bookService.findById(BigInt(id));
  }

  @Get('/view/:filename')
  @Roles()
  async downloadEbookFile(@Param('filename') filename: string, @Res() res: Response) {
    const folder =
      this.configService.get<string>(filename.endsWith('.pdf') ? 'EBOOK_FOLDER' : 'COVER_IMAGES_FOLDER') ||
      '';

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
        fileFilter: (req, file, callback) => {
          let maxMBs = 2;
          let maxBytes = maxMBs * 1024 * 1024;
          if (file.fieldname === 'coverImageFile') {
            if (file.size > maxBytes) {
              callback(
                new BadRequestException({
                  coverImageFile: `Không được lớn hơn ${maxMBs}MB`,
                  statusCode: HttpStatus.BAD_REQUEST,
                }),
                false,
              );
            } else if (!coverImageMimeFileTypes.includes(file.mimetype)) {
              callback(
                new BadRequestException({
                  coverImageFile: `Phải có định dạng là ${coverImageMimeFileTypes.join(' hoặc ')}`,
                  statusCode: HttpStatus.BAD_REQUEST,
                }),
                false,
              );
            }
            callback(null, true);
          } else {
            maxMBs = 60;
            maxBytes = maxMBs * 1024 * 1024;
            if (file.size > maxBytes) {
              callback(
                new BadRequestException({
                  ebookFile: `Không được lớn hơn ${maxMBs}MB`,
                  statusCode: HttpStatus.BAD_REQUEST,
                }),
                false,
              );
            } else if (!ebookMimeFileTypes.includes(file.mimetype)) {
              callback(
                new BadRequestException({
                  ebookFile: `Phải có định dạng là ${ebookMimeFileTypes.join(' hoặc ')}`,
                  statusCode: HttpStatus.BAD_REQUEST,
                }),
                false,
              );
            }
            callback(null, true);
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
  ) {
    if (!bookData || Object.keys.length <= 0) throw new BadRequestException('empty data');
    console.log('ebookFile:::', ebookFile ? ebookFile[0].filename : undefined);

    //logic save  file
    const uploadFoldername = this.configService.get<string>('UPLOAD_FOLDER') || 'uploads';

    if (!fs.existsSync(uploadFoldername)) fs.mkdirSync(uploadFoldername);

    let { coverImageFilename, ebookFilename }: FileNameObjectType = {
      coverImageFilename: '',
      ebookFilename: '',
    };

    if (ebookFile && ebookFile.length > 0) {
      const uploadFolder = this.configService.get<string>('EBOOK_FOLDER') ?? 'uploads';

      const uploadPath = join(process.cwd(), uploadFolder);

      ebookFilename = saveFile(ebookFile[0], uploadPath);
    }

    if (coverImageFile && coverImageFile.length > 0) {
      const uploadFolder = this.configService.get<string>('COVER_IMAGES_FOLDER') ?? 'uploads';

      const uploadPath = join(process.cwd(), uploadFolder);

      coverImageFilename = saveFile(coverImageFile[0], uploadPath);
    }

    //send book object and save it into db
    return this.bookService.create({
      ...bookData,
      contentFilename: ebookFilename !== '' ? ebookFilename : undefined,
      coverImageFilename: coverImageFilename !== '' ? coverImageFilename : undefined,
    });
  }

  @Patch('/:id')
  update(
    @Param('id') id: string,
    @Body()
    bookData: UpdateBookDto,
  ) {
    if (!bookData) throw new BadRequestException('empty data');

    return this.bookService.update(BigInt(id), bookData);
  }

  @Delete('/:id')
  delete(@Param('id') id: string) {
    return this.bookService.delete(BigInt(id));
  }
}
