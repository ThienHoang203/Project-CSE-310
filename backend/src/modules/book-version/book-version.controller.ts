import { Controller } from '@nestjs/common';
import { BookVersionService } from './book-version.service';

@Controller('book-version')
export class BookVersionController {
  constructor(private readonly bookVersionService: BookVersionService) {}
}
