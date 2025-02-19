import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AbstractEntity } from './entity';
import { User } from './user.entity';
import { Book } from './book.entity';

export enum ReservationStatus {
  WAI = 'waiting',
  SUC = 'successful',
  CAN = 'cancel',
}

@Entity()
export class Reservation extends AbstractEntity {
  @Column({ type: 'bigint', nullable: false })
  userId: bigint;

  @Column({ type: 'bigint', nullable: false })
  bookId: bigint;

  @Column({ type: 'enum', enum: ReservationStatus, default: ReservationStatus.WAI, nullable: false })
  status: ReservationStatus;

  @JoinColumn()
  @ManyToOne(() => User, (user) => user.reservations)
  user: User;

  @JoinColumn()
  @ManyToOne(() => Book, (book) => book.reservations)
  book: Book;
}
