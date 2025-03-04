import { AbstractEntity } from 'src/entities/entity';
import { Entity, Column, OneToMany, OneToOne } from 'typeorm';
import { BorrowingTransaction } from './borrowing-transaction.entity';
import { Reservation } from './reservation.entity';
import { Rating } from './rating.entity';
import { Bookshelf } from './bookshelf.entity';

export enum BookGerne {
  MYSTERY = 'trinh thám',
  ROMANCE = 'lãng mạn',
  FANTASY = 'kỳ ảo',
  SCIENCE_FICTION = 'khoa học viễn tưởng',
  HORROR = 'kinh dị',
  THRILLER = 'giật gân / hồi hộp',
}

export enum BookFormat {
  PHYS = 'bản in',
  DIG = 'bản điện tử',
}

export enum BookStatus {
  UNAVAIL = 'unavailable',
  AVAIL = 'available',
  BOR = 'borrowed',
  MIS = 'missing',
}

@Entity()
export class Book extends AbstractEntity {
  @Column({ type: 'varchar', length: 200, nullable: false })
  title: string;

  @Column({ type: 'enum', enum: BookStatus, default: BookStatus.UNAVAIL, nullable: false })
  status: BookStatus;

  @Column({ type: 'enum', enum: BookFormat, nullable: false })
  format: BookFormat;

  @Column({ type: 'varchar', length: 50, nullable: false })
  author: string;

  @Column({ type: 'enum', enum: BookGerne, nullable: true })
  gerne: BookGerne;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  coverImageFilename: string;

  @Column({ type: 'int', nullable: true })
  stock: number;

  @Column({ type: 'date', nullable: true })
  publishedDate: Date;

  @Column({ type: 'varchar', length: 300, nullable: true })
  contentFilename: string;

  @Column({ type: 'decimal', precision: 4, scale: 2, default: 1.0, nullable: true })
  version: number;

  @OneToMany(() => BorrowingTransaction, (borrowingTransaction) => borrowingTransaction.book)
  borrowingTransactions: BorrowingTransaction[];

  @OneToOne(() => Rating, (rating) => rating.book)
  rating: Rating;

  @OneToMany(() => Reservation, (reservation) => reservation.book)
  reservations: Reservation[];

  @OneToMany(() => Bookshelf, (bookshelf) => bookshelf.book)
  bookshelf: Bookshelf[];
}
