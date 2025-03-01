import { BadRequestException, HttpStatus } from '@nestjs/common';
import { Request } from 'express';

export const coverImgMimeType = ['image/jpg', 'image/jpeg', 'image/png'];

export const coverImageExtType = ['.jpg', '.jpeg', '.png'];

export const ebookMimeType = ['application/pdf', 'application/epub+zip'];

export const ebookExtType = ['.pdf', '.epub'];

export function fileFilter(
  request: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
): void {
  console.log('Request:::', request.files);

  if (file.fieldname === 'coverImageFile' && !coverImgMimeType.includes(file.mimetype)) {
    return callback(
      new BadRequestException({
        coverImageFile: `Phải có định dạng là ${coverImageExtType.join(' hoặc ')}`,
        statusCode: HttpStatus.BAD_REQUEST,
      }),
      false,
    );
  } else if (file.fieldname === 'ebookFile' && !ebookMimeType.includes(file.mimetype)) {
    return callback(
      new BadRequestException({
        ebookFile: `Phải có định dạng là ${ebookExtType.join(' hoặc ')}`,
        statusCode: HttpStatus.BAD_REQUEST,
      }),
      false,
    );
  }
  return callback(null, true);
}
