import { Column, Entity } from 'typeorm';
import { AbstractEntity } from './entity';

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
}
