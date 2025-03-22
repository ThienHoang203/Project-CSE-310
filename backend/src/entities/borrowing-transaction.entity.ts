import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { User } from './user.entity';
import { Book } from './book.entity';
import { Fine } from './fine.entity';
import { AbstractEntity } from './entity';

export enum BorrowingTransactionStatus {
  CANC = 'canceled',
  WAIT = 'waiting',
  BOR = 'borrowing',
  RET = 'returned',
  OVER = 'overdue',
  MIS = 'book missing',
}

export enum BorrowingTransactionSortType {
  BORROWED_AT = 'borrowedAt',
  DUE_DATE = 'dueDate',
  RETURNED_AT = 'returnedAt',
  BOOK_ID = 'bookId',
  UPDATED_AT = 'updatedAt',
}

export enum AdminBorrowingTransactionSortType {
  BORROWED_AT = 'borrowedAt',
  DUE_DATE = 'dueDate',
  RETURNED_AT = 'returnedAt',
  BOOK_ID = 'bookId',
  USER_ID = 'userId',
  UPDATED_AT = 'updatedAt',
}

@Entity()
export class BorrowingTransaction extends AbstractEntity {
  @Column({ type: 'int', nullable: false })
  userId: number;

  @Column({ type: 'int', nullable: false })
  bookId: number;

  @CreateDateColumn({ type: 'timestamp', nullable: false })
  borrowedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date;

  @Column({
    type: 'enum',
    enum: BorrowingTransactionStatus,
    default: BorrowingTransactionStatus.WAIT,
    nullable: false,
  })
  status: BorrowingTransactionStatus;

  @Column({ type: 'timestamp', nullable: true })
  returnedAt: Date;

  @JoinColumn()
  @ManyToOne(() => User, (user) => user.borrowingTransactions, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  user: User;

  @JoinColumn()
  @ManyToOne(() => Book, (book) => book.borrowingTransactions, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  book: Book;

  @OneToOne(() => Fine, (fine) => fine.borrowingTransaction, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  fine: Fine;
}
