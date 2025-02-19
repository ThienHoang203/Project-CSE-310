import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { AbstractEntityLight } from './entity-light.entity';
import { User } from './user.entity';
import { Book } from './book.entity';
import { Fine } from './fine.entity';

export enum BorrowingTransactionStatus {
  BOR = 'borrowing',
  RET = 'returned',
  OVER = 'overdue',
  MIS = 'book missing',
}

@Entity()
export class BorrowingTransaction extends AbstractEntityLight {
  @Column({ type: 'bigint', nullable: false })
  userId: bigint;

  @Column({ type: 'bigint', nullable: false })
  bookId: bigint;

  @CreateDateColumn({ type: 'timestamp', nullable: false })
  borrowedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date;

  @Column({
    type: 'enum',
    enum: BorrowingTransactionStatus,
    default: BorrowingTransactionStatus.BOR,
    nullable: false,
  })
  status: BorrowingTransactionStatus;

  @Column({ type: 'timestamp', nullable: true })
  returnedAt: Date;

  @JoinColumn()
  @ManyToOne(() => User, (user) => user.borrowingTransactions)
  user: User;

  @JoinColumn()
  @ManyToOne(() => Book, (book) => book.borrowingTransactions)
  book: Book;

  @OneToMany(() => Fine, (fine) => fine.borrowingTransaction)
  fines: Fine[];
}
