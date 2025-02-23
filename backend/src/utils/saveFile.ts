import * as fs from 'fs';
import path, { join, parse } from 'path';

export function saveFile(file: Express.Multer.File, uploadPath: string): string {
  if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);

  const parsedFile: path.ParsedPath = parse(file.originalname);

  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

  const filename = `${parsedFile.name}-${uniqueSuffix}${parsedFile.ext}`;

  const filePath = join(uploadPath, filename);

  fs.writeFileSync(filePath, file.buffer);

  return filename;
}
