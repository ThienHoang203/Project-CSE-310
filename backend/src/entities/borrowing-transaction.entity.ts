import { Column, CreateDateColumn, Entity } from 'typeorm';
import { AbstractEntityLight } from './entity-light.entity';

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
}
