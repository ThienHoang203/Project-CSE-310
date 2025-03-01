import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateBorrowingTransactionDto } from './dto/create-borrowing-transaction.dto';
import { UpdateBorrowingTransactionDto } from './dto/update-borrowing-transaction.dto';
import { Book, BookFormat } from 'src/entities/book.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { BorrowingTransaction } from 'src/entities/borrowing-transaction.entity';

@Injectable()
export class BorrowingTransactionService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(User)
    private readonly userRepository: Repository<Book>,
    @InjectRepository(BorrowingTransaction)
    private readonly borrowingTransactionRepository: Repository<BorrowingTransaction>,
  ) {}

  async create(
    createBorrowingTransactionDto: CreateBorrowingTransactionDto,
  ): Promise<{ id: any; message: string }> {
    const { bookId, borrowedAt, dueDate, userId } = createBorrowingTransactionDto;

    const isExisting = await this.userRepository.existsBy({ id: userId });
    if (!isExisting) {
      throw new BadRequestException({
        message: `Không tồn tại userId: ${userId}`,
        userId: userId,
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const book = await this.bookRepository.findOneBy({ id: bookId });
    if (!book) {
      throw new BadRequestException({
        message: `Không tồn tại bookId: ${bookId}`,
        bookId: bookId,
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    if (book.format !== BookFormat.PHYS) {
      throw new BadRequestException({
        message: 'Không có định dạng vật lí cho sách này!',
        bookId: bookId,
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    if (book.stock < 1) {
      throw new BadRequestException({
        message: 'Số lượng sách không đủ',
        bookId: bookId,
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const res = await this.bookRepository.update({ id: book.id }, { stock: book.stock - 1 });

    if (res.affected === undefined)
      throw new InternalServerErrorException('Server bị lỗi, vui lòng thử lại!');

    if (res.affected === 0) throw new ForbiddenException('tạo mới không thành công');

    const result = await this.borrowingTransactionRepository.insert(createBorrowingTransactionDto);

    if (result.identifiers.length !== 1)
      throw new InternalServerErrorException('Server bị lỗi, vui lòng thử lại!');

    return { id: result.identifiers[0], message: 'Tạo thành công' };
  }

  async findAll(): Promise<BorrowingTransaction[]> {
    const result = await this.borrowingTransactionRepository.find();

    if (!result || result.length === 0)
      throw new NotFoundException('Không tìm thấy bất kỳ borrowing transaction!');

    return result;
  }

  async findById(id: number): Promise<BorrowingTransaction> {
    const result = await this.borrowingTransactionRepository.findOneBy({ id });

    if (!result) throw new NotFoundException(`Không tìm thấy borrowing transaction có id: ${id}`);

    return result;
  }

  async update(
    id: number,
    updateBorrowingTransactionDto: UpdateBorrowingTransactionDto,
  ): Promise<{ message: string; id: number }> {
    const result = await this.borrowingTransactionRepository.update(
      { id: id },
      updateBorrowingTransactionDto,
    );
    if (result.affected === undefined)
      throw new InternalServerErrorException('Server bị lỗi, vui lòng thử lại!');

    if (result.affected < 0) throw new NotFoundException(`Không tìm thấy borrowing transaction có id: ${id}`);

    return {
      id: id,
      message: 'Cập nhật thành công!',
    };
  }

  async remove(id: number): Promise<{ message: string; id: number }> {
    const result = await this.borrowingTransactionRepository.delete({ id: id });

    if (result.affected === undefined)
      throw new InternalServerErrorException('Server bị lỗi, vui lòng thử lại!');

    if (result.affected === null || result.affected === 0)
      throw new NotFoundException(`Không tìm thấy borrowing transaction có id: ${id}`);

    return {
      message: 'Xóa thành công!',
      id: id,
    };
  }
}
