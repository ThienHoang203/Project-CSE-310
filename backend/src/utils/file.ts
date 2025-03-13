import { InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';
import path, { join, parse } from 'path';

export enum UploadCategory {
  COVERS = 'covers',
  EBOOKS = 'ebooks',
}

export const folderUploadConvertBookAttribute = {
  [`${UploadCategory.COVERS}`]: 'coverImageFilename',
  [`${UploadCategory.EBOOKS}`]: 'contentFilename',
};

export function replaceFile(file: Express.Multer.File, folderPath: string, oldFileName?: string) {
  //would remove old file if it existed
  if (oldFileName && oldFileName !== '') {
    const result = removeFile(oldFileName, folderPath);

    if (!result) throw new InternalServerErrorException(`Không thể xóa file: ${oldFileName}`);
  }
  //save file and get the file's name
  return saveFile(file, folderPath);
}

export function saveFile(file: Express.Multer.File, folderPath: string): string {
  const parsedFile: path.ParsedPath = parse(file.originalname);

  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const filename = `${parsedFile.name}-${uniqueSuffix}${parsedFile.ext}`;

  const filePath = join(process.cwd(), folderPath, filename);

  fs.writeFileSync(filePath, file.buffer);

  return filename;
}

export async function removeFile(filename: string, folderPath: string): Promise<boolean> {
  const filePath = join(process.cwd(), folderPath, filename);
  if (!fs.existsSync(filePath)) return false;

  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    return false;
  }

  return true;
}

export function createFolderIfAbsent(folderPath: string) {
  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath);
}
