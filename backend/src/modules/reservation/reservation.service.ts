import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { In, Not, Repository } from 'typeorm';
import { Reservation, ReservationStatus } from 'src/entities/reservation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from '../user/user.service';
import { BookService } from '../book/book.service';
import { BorrowingTransactionService } from '../borrowing-transaction/borrowing-transaction.service';
import { Book, BookFormat } from 'src/entities/book.entity';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly userService: UserService,
    private readonly bookService: BookService,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    private readonly borrowingTransactionService: BorrowingTransactionService,
  ) {}

  async create(
    userId: number,
    { bookId }: CreateReservationDto,
  ): Promise<{ id: number; userId: number; bookId: number }> {
    await this.userService.hasUserId(userId);

    const book = await this.bookService.findById(bookId);

    const hasBeenReserved = await this.reservationRepository.existsBy({
      userId,
      bookId,
      status: Not(In([ReservationStatus.CANC])),
    });

    if (hasBeenReserved)
      throw new ForbiddenException(`Đã có reservation cho userId: ${userId} và bookId: ${bookId}`);

    //Check if book's format is physical
    if (book.format !== BookFormat.PHYS)
      throw new BadRequestException(`bookId: ${bookId} không phải định dạng vật lí!`);

    //Check if the user is not allowed to borrow book
    await this.borrowingTransactionService.isAllowedToBorrow(userId);

    const result = await this.reservationRepository.insert({ bookId, userId });
    if (result.identifiers.length === 0)
      throw new InternalServerErrorException('Tạo mới thất bại!');

    return { id: result.identifiers[0].id, bookId: bookId, userId };
  }

  async findAll(): Promise<{ totalReservations: number; reservations: Reservation[] }> {
    const [reservations, total] = await this.reservationRepository.findAndCount();
    return { totalReservations: total, reservations: reservations };
  }

  async findAllByBookId(
    bookId: number,
  ): Promise<{ totalReservations: number; reservations: Reservation[] }> {
    const [reservations, total] = await this.reservationRepository.findAndCountBy({ bookId });
    return { totalReservations: total, reservations: reservations };
  }

  async findAllByUserId(
    userId: number,
  ): Promise<{ totalReservations: number; reservations: Reservation[] }> {
    const [reservations, total] = await this.reservationRepository.findAndCountBy({ userId });
    return { totalReservations: total, reservations: reservations };
  }

  as;

  async findOneById(id: number): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOneBy({ id });
    if (!reservation) throw new NotFoundException(`reservationId: ${id} không tồn tại!`);
    return reservation;
  }

  async findOneByIdAndUserId(id: number, userId: number): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOneBy({ id, userId });
    if (!reservation)
      throw new NotFoundException(`reservationId: ${id} với userId: ${userId} không tồn tại!`);
    return reservation;
  }

  async findOneByuserIdAndBookId(userId: number, bookId: number): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOneBy({ userId, bookId });
    if (!reservation)
      throw new NotFoundException(`Không có reservation có userId: ${userId} và bookId: ${bookId}`);
    return reservation;
  }

  async update(
    id: number,
    userId: number,
    status: ReservationStatus,
  ): Promise<{ reservationId: number; userId: number }> {
    const reservation = await this.findOneByIdAndUserId(id, userId);

    if (status === ReservationStatus.SUC) {
      const bookUpdateResult = await this.bookRepository
        .createQueryBuilder()
        .update()
        .set({ waitingBorrowCount: () => '"waitingBorrowCount" + 1' })
        .where('"stock" >= "waitingBorrowCount" + 1')
        .execute();
      if (bookUpdateResult.affected === 0)
        throw new BadRequestException(
          `Không thể accept reservationId: ${id}, vui lòng kiểm tra số lượng sách trong kho!`,
        );
    }
    const result = await this.reservationRepository.update({ id }, { status: status });

    if (result.affected === 0)
      throw new InternalServerErrorException(`reservationId: ${id} cập nhật không thành công!`);

    return { reservationId: reservation.id, userId };
  }

  async remove(
    reservationId: number,
    userId: number,
  ): Promise<{ reservationId: number; userId: number }> {
    const hasReservation = await this.reservationRepository.existsBy({ id: reservationId, userId });
    if (!hasReservation)
      throw new NotFoundException(
        `Không tồn tại reservation với ID: ${reservationId} và userId: ${userId}!`,
      );
    return { reservationId: reservationId, userId };
  }
}
