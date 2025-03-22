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
import { In, MoreThan, Not, Repository } from 'typeorm';
import {
  BorrowingTransaction,
  BorrowingTransactionStatus,
} from 'src/entities/borrowing-transaction.entity';
import { UserService } from '../user/user.service';
import PaginationBorrowingTransactionDto from './dto/pagination-borrowing-transaction.dto';

@Injectable()
export class BorrowingTransactionService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,

    private readonly userService: UserService,
    @InjectRepository(BorrowingTransaction)
    private readonly borrowingTransactionRepository: Repository<BorrowingTransaction>,
  ) {}

  async isAllowedToBorrow(userId: number): Promise<true> {
    const transaction = await this.borrowingTransactionRepository.findOne({
      where: {
        userId,
        status: In([BorrowingTransactionStatus.OVER, BorrowingTransactionStatus.MIS]),
      },
      select: ['status'],
    });
    if (transaction)
      throw new ForbiddenException({
        message: `user(ID:${userId}) không được phép mượn thêm sách!`,
        transactionStatus: transaction.status,
        statusCode: HttpStatus.FORBIDDEN,
      });
    return true;
  }

  async canCreateTransaction(userId: number, bookId: number): Promise<true> {
    const transaction = await this.borrowingTransactionRepository.findOne({
      where: {
        userId,
        bookId,
        status: Not(In([BorrowingTransactionStatus.CANC, BorrowingTransactionStatus.RET])),
      },
      select: ['status'],
    });
    if (transaction)
      throw new ForbiddenException({
        message: `User(ID: ${userId}) đã tạo giao dịch mượn sách(ID: ${bookId}) này!`,
        transactionStatus: transaction.status,
        statusCode: HttpStatus.FORBIDDEN,
      });
    return true;
  }

  async create(
    userId: number,
    createBorrowingTransactionDto: CreateBorrowingTransactionDto,
  ): Promise<{ id: any }> {
    const { bookId } = createBorrowingTransactionDto;

    await this.userService.hasUserId(userId);

    const book = await this.bookRepository.findOneBy({ id: bookId });
    if (!book) {
      throw new NotFoundException({
        message: `Không tồn tại bookId: ${bookId}`,
        bookId: bookId,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    if (book.format !== BookFormat.PHYS)
      throw new BadRequestException(`BookId: ${bookId} không phải sách in!`);

    //check if this book's stock is lower than 1, this request have to cancel!
    if (book.stock < 1 || book.stock <= book.waitingBorrowCount) {
      throw new BadRequestException({
        message: 'Số lượng sách không đủ',
        bookId: bookId,
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    //if the user has any book overdue or missing, the user can not borrow any book at all
    await this.isAllowedToBorrow(userId);

    await this.canCreateTransaction(userId, bookId);

    const resultIncreaseWaiting = await this.bookRepository.update(
      { id: book.id },
      { waitingBorrowCount: book.waitingBorrowCount + 1 },
    );

    if (!resultIncreaseWaiting?.affected || resultIncreaseWaiting.affected === 0)
      throw new InternalServerErrorException(
        `Cập nhật borrowingWaitingCount của bookId: ${book.id} thất bại!`,
      );

    const result = await this.borrowingTransactionRepository.insert({
      ...createBorrowingTransactionDto,
      userId: userId,
    });

    if (result.identifiers.length < 1)
      throw new InternalServerErrorException('Tạo giao dịch mới thất bại!');

    return { id: result.identifiers[0].id };
  }

  async findAll(): Promise<{ totalTransactions: number; transactions: BorrowingTransaction[] }> {
    const [transactions, count] = await this.borrowingTransactionRepository.findAndCount();

    return { totalTransactions: count, transactions: transactions };
  }

  async paginateTransactionByUserId(
    userId: number,
    { limit, page, sortBy, sortOrder }: PaginationBorrowingTransactionDto,
  ): Promise<{ totalTransactions: number; transactions: BorrowingTransaction[] }> {
    let transactions: BorrowingTransaction[];

    if (page === undefined || limit === undefined)
      transactions = await this.borrowingTransactionRepository.find({
        where: { userId },
        order: { [sortBy]: sortOrder },
      });
    else
      transactions = await this.borrowingTransactionRepository.find({
        where: { userId },
        order: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      });

    return { totalTransactions: transactions.length, transactions: transactions };
  }

  async findById(id: number): Promise<BorrowingTransaction> {
    const result = await this.borrowingTransactionRepository.findOneBy({ id });

    if (!result) throw new NotFoundException(`Không tìm thấy borrowing transaction có id: ${id}`);

    return result;
  }

  async findOneForTheUser(userId: number, transactionId: number): Promise<BorrowingTransaction> {
    const transaction = await this.borrowingTransactionRepository.findOneBy({
      id: transactionId,
      userId,
    });

    if (!transaction)
      throw new NotFoundException(
        `There's no transaction with transactionId: ${transactionId} and userId: ${userId}!`,
      );

    return transaction;
  }

  async cancelOneForTheUser(
    userId: number,
    transactionId: number,
  ): Promise<{ transactionId: number }> {
    const transaction = await this.borrowingTransactionRepository.findOne({
      where: { id: transactionId, userId },
      select: ['status'],
    });

    if (!transaction)
      throw new NotFoundException(
        `There's no transaction with transactionId: ${transactionId} and userId: ${userId}!`,
      );

    if (transaction.status !== BorrowingTransactionStatus.WAIT)
      throw new ForbiddenException({
        message: `transaction(ID: ${transactionId}) is not allowed to change`,
        transactionStatus: transaction.status,
        statusCode: HttpStatus.FORBIDDEN,
      });

    const result = await this.borrowingTransactionRepository.update(
      { id: transactionId },
      { status: BorrowingTransactionStatus.CANC },
    );

    if (!result?.affected || result.affected === 0)
      throw new InternalServerErrorException(`Hủy transaction(ID: ${transactionId}) thất bại`);

    return { transactionId };
  }

  async acceptOneTransaction(transactionId: number): Promise<{ transactionId: number }> {
    const transaction = await this.borrowingTransactionRepository.findOne({
      where: { id: transactionId },
      select: ['status', 'bookId'],
    });

    if (!transaction)
      throw new NotFoundException(`Không tìm thấy transaction(ID: ${transactionId}) này!`);

    const { status, bookId } = transaction;

    if (status !== BorrowingTransactionStatus.WAIT)
      throw new ForbiddenException(`Không được phép thay đổi transaction(${transactionId}) này!`);

    const book = await this.bookRepository.findOne({
      where: { id: bookId },
      select: ['stock', 'waitingBorrowCount'],
    });

    if (!book) throw new NotFoundException(`Không tìm thấy book(ID: ${bookId}) này!`);

    const { stock, waitingBorrowCount } = book;

    if (stock < 1 || waitingBorrowCount < 1)
      throw new BadRequestException({
        message: `transaction(ID: ${transactionId}) không được chấp nhận`,
        book: { id: bookId, stock, waitingBorrowCount },
        statusCode: HttpStatus.BAD_REQUEST,
      });

    const updateBookResult = await this.bookRepository.update(
      { id: bookId },
      {
        stock: stock - 1,
        waitingBorrowCount: waitingBorrowCount - 1,
      },
    );

    if (!updateBookResult?.affected || updateBookResult.affected === 0)
      throw new InternalServerErrorException(
        `transaction(ID: ${transactionId}) chấp nhận thất bại!`,
      );

    const acceptResult = await this.borrowingTransactionRepository.update(
      { id: transactionId },
      { status: BorrowingTransactionStatus.BOR },
    );

    if (!acceptResult?.affected || acceptResult.affected === 0)
      throw new InternalServerErrorException(
        `transaction(ID: ${transactionId}) chấp nhận thất bại!`,
      );

    return { transactionId };
  }

  async update(
    transactionId: number,
    updateData: UpdateBorrowingTransactionDto,
  ): Promise<{ transactionId: number }> {
    const hasTransaction = await this.borrowingTransactionRepository.existsBy({
      id: transactionId,
    });

    if (!hasTransaction)
      throw new NotFoundException(`Không tìm thấy transaction(Id: ${transactionId}) này!`);

    const result = await this.borrowingTransactionRepository.update(
      { id: transactionId },
      updateData,
    );

    if (!result?.affected || result.affected === 0)
      throw new InternalServerErrorException(
        `Cập nhật transaction(ID: ${transactionId}) thất bại!`,
      );

    return {
      transactionId,
    };
  }

  async remove(transactionId: number): Promise<{ transactionId: number }> {
    const transaction = await this.findById(transactionId);

    if (!transaction)
      throw new NotFoundException(`Không tìm thấy transaction(Id: ${transactionId}) này!`);

    if (
      transaction.status === BorrowingTransactionStatus.BOR ||
      transaction.status === BorrowingTransactionStatus.MIS ||
      transaction.status === BorrowingTransactionStatus.OVER
    ) {
      throw new ForbiddenException({
        message: `Không thể xóa transaction(ID: ${transactionId})`,
        transactionStatus: transaction.status,
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    if (transaction.status === BorrowingTransactionStatus.WAIT)
      this.bookRepository.decrement(
        { id: transaction.bookId, waitingBorrowCount: MoreThan(0) },
        'waitingBorrowCount',
        1,
      );
    const result = await this.borrowingTransactionRepository.delete({ id: transactionId });

    if (!result?.affected || result.affected === 0)
      throw new InternalServerErrorException(`Xóa transaction có id: ${transactionId} thất bại`);

    return {
      transactionId,
    };
  }
}
