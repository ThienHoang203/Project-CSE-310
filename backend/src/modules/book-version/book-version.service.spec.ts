import { Test, TestingModule } from '@nestjs/testing';
import { BookVersionService } from './book-version.service';

describe('BookVersionService', () => {
  let service: BookVersionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookVersionService],
    }).compile();

    service = module.get<BookVersionService>(BookVersionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
