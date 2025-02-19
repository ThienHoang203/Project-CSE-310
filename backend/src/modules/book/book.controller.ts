import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { BookService } from './book.service';
import UpdateBookDto from './dto/update-book.dto';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import InputBookDto from './dto/input-book.dto';
import { Public } from 'src/decorator/public-route.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import FormData from 'form-data';

@Controller('book')
export class BookController {
  constructor(
    private readonly bookService: BookService,
    private readonly httpService: HttpService,
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

  @Public()
  @Post('/free')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'contentFile', maxCount: 1 },
      { name: 'coverImageFile', maxCount: 1 },
    ]),
  )
  async cr(
    @UploadedFiles()
    files: {
      contentFile?: Express.Multer.File[];
      coverImageFile?: Express.Multer.File[];
    },
  ) {
    const port = this.configService.get<number>('PORT') || 3000;

    let coverPath: string | null = null;
    let contentPath: string | null = null;

    if (files.coverImageFile && files.coverImageFile[0]) {
      const coverFile = files.coverImageFile[0];
      const formData = new FormData();
      formData.append(
        'coverImageFile',
        fs.createReadStream(coverFile.path),
        {
          filename: coverFile.originalname,
          contentType: coverFile.mimetype,
        },
      );
      const coverUpload = await this.httpService.axiosRef.post(
        `http://localhost:${port}/api/files/upload-cover`,
        files.coverImageFile[0].buffer,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      coverPath = coverUpload.data.path;
    }
  }

  @Public()
  @Post()
  async create(
    @Body()
    bookData: InputBookDto,
  ) {
    if (!bookData || Object.keys.length <= 0) {
      throw new HttpException('empty data', HttpStatus.BAD_REQUEST);
    }

    const {
      coverImageFile,
      contentFile,
      author,
      description,
      format,
      gerne,
      publishedDate,
      status,
      stock,
      title,
      version,
    } = bookData;
    const port = this.configService.get<number>('PORT') || 3000;
    const coverUpload = await this.httpService.axiosRef.post(
      `http://localhost:${port}/api/files/upload-cover`,

      coverImageFile,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    console.log(coverUpload.data);

    const coverPath = coverUpload.data.path;

    const contentUpload = await this.httpService.axiosRef.post(
      `http://localhost:${port}/api/files/upload-content`,
      contentFile,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    const contentPath = coverUpload.data.path;

    return this.bookService.create({
      author,
      contentFileURL: contentPath ?? null,
      coverImageFileURL: coverPath ?? null,
      description: description ?? null,
      format,
      gerne,
      publishedDate,
      status,
      stock,
      title,
      version,
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
