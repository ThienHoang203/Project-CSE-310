import { Test, TestingModule } from '@nestjs/testing';
import { BookVersionController } from './book-version.controller';
import { BookVersionService } from './book-version.service';

describe('BookVersionController', () => {
  let controller: BookVersionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookVersionController],
      providers: [BookVersionService],
    }).compile();

    controller = module.get<BookVersionController>(BookVersionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
