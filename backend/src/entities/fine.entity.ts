import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from './entity';
import { User } from './user.entity';
import { BorrowingTransaction } from './borrowing-transaction.entity';

export enum FineStatus {
  PA = 'paid',
  UPA = 'unpaid',
}

@Entity()
export class Fine extends AbstractEntity {
  @Column({ type: 'int', nullable: false })
  userId: number;

  @Column({ type: 'int', nullable: false })
  borrowingTransactionId: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  amount: number;

  @Column({ type: 'enum', enum: FineStatus, default: FineStatus.UPA, nullable: false })
  status: FineStatus;

  @JoinColumn()
  @ManyToOne(() => User, (user) => user.fines, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  user: User;

  @JoinColumn()
  @ManyToOne(() => BorrowingTransaction, (borrowingTransaction) => borrowingTransaction.fine, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  borrowingTransaction: BorrowingTransaction;
}
