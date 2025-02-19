import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { AbstractEntity } from './entity';
import { User } from './user.entity';
import { BorrowingTransaction } from './borrowing-transaction.entity';

export enum FineStatus {
  PA = 'paid',
  UPA = 'unpaid',
}

@Entity()
export class Fine extends AbstractEntity {
  @Column({ type: 'bigint', nullable: false })
  userId: bigint;

  @Column({ type: 'bigint', nullable: false })
  borrowingTransactionId: bigint;

  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  amount: number;

  @Column({ type: 'enum', enum: FineStatus, default: FineStatus.UPA, nullable: false })
  status: FineStatus;

  @JoinColumn()
  @ManyToOne(() => User, (user) => user.fines)
  user: User;

  @JoinColumn()
  @ManyToOne(() => BorrowingTransaction, (borrowingTransaction) => borrowingTransaction.fines)
  borrowingTransaction: BorrowingTransaction;
}
