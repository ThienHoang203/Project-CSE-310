import { BadRequestException, Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Public } from 'src/decorator/public-route.decorator';
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {
    const detinationFolder = configService.get<string>('MULTER_DEST');
  }

  @Public()
  @Post('/upload-cover')
  @UseInterceptors(
    FileInterceptor('coverImageFile', {
      fileFilter(req, file, callback) {
        if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.mimetype)) {
          return callback(new BadRequestException('the content file must be JPEG, PNG, GIF'), false);
        }
        callback(null, true);
      },
      storage: diskStorage({
        destination: function (req, file, cb) {
          cb(new BadRequestException('lỗi khi tải coverImageFile'), './uploads/covers');
        },
        filename: function (req, file, cb) {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, file.fieldname + '-' + uniqueSuffix);
        },
      }),
    }),
  )
  uploadCover(@UploadedFile() coverImageFile: Express.Multer.File, @Body() body: any) {
    if (!coverImageFile) throw new BadRequestException('There is no cover file');
    return {
      message: 'Cover uploaded!',
      filename: coverImageFile.filename,
      path: `/uploads/content/${coverImageFile.filename}`,
    };
  }

  @Public()
  @Post('/upload-content')
  @UseInterceptors(
    FileInterceptor('contentFile', {
      fileFilter(req, file, callback) {
        if (
          ![
            'application/pdf',
            'text/plain',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          ].includes(file.mimetype)
        ) {
          return callback(new BadRequestException('the content file must be PDF, TXT, DOC'), false);
        }
        callback(null, true);
      },
      storage: diskStorage({
        destination: function (req, file, cb) {
          cb(new BadRequestException('lỗi khi tải contentFile'), './uploads/contents');
        },
        filename: function (req, file, cb) {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, file.fieldname + '-' + uniqueSuffix);
        },
      }),
      limits: {
        files: 1,
        fileSize: 100 * 1024 * 1024, // 100MB
        fieldSize: 100 * 1024 * 1024, // 100MB
        fields: 1,
      },
    }),
  )
  uploadContent(@UploadedFile() coverImageFile: Express.Multer.File, @Body() body: any) {
    if (!coverImageFile) throw new BadRequestException('There is no content file');
    return {
      message: 'Content uploaded!',
      filename: coverImageFile.filename,
      path: `/uploads/content/${coverImageFile.filename}`,
    };
  }
}
