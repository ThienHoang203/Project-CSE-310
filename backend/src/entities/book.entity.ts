import { AbstractEntity } from 'src/entities/entity';
import { Entity, Column, OneToMany } from 'typeorm';
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

export enum BookSortType {
  ID = 'id',
  TITLE = 'title',
  FORMAT = 'format',
  AUTHOR = 'author',
  GERNE = 'gerne',
  STOCK = 'stock',
  WAITING_BORROW_COUNT = 'waitingBorrowCount',
  PUBLISHED_DATE = 'publishedDate',
  VERSION = 'version',
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
}

@Entity()
export class Book extends AbstractEntity {
  @Column({ type: 'varchar', length: 200, nullable: false })
  title: string;

  @Column({ type: 'enum', enum: BookFormat, nullable: false })
  format: BookFormat;

  @Column({ type: 'varchar', length: 50, nullable: false })
  author: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  coverImageFilename: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  contentFilename: string;

  @Column({ type: 'enum', enum: BookGerne, nullable: true })
  gerne: BookGerne;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', nullable: false, default: 0 })
  stock: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  waitingBorrowCount: number;

  @Column({ type: 'date', nullable: true })
  publishedDate: Date;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  version: number;

  @OneToMany(() => BorrowingTransaction, (borrowingTransaction) => borrowingTransaction.book, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  borrowingTransactions: BorrowingTransaction[];

  @OneToMany(() => Rating, (rating) => rating.book, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  rating: Rating;

  @OneToMany(() => Reservation, (reservation) => reservation.book, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  reservations: Reservation[];

  @OneToMany(() => Bookshelf, (bookshelf) => bookshelf.book, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  bookshelf: Bookshelf[];
}
