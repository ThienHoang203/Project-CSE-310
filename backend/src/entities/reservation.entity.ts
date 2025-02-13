import { Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { AbstractEntity } from './entity';

export enum ReservationStatus {
  WAI = 'waiting',
  SUC = 'successful',
  CAN = 'cancel',
}

export class Reservation extends AbstractEntity {
  @Column({ type: 'bigint', nullable: false })
  userId: bigint;

  @Column({ type: 'bigint', nullable: false })
  book_id: bigint;

  @Column({ type: 'enum', enum: ReservationStatus, default: ReservationStatus.WAI, nullable: false })
  status: ReservationStatus;
}
