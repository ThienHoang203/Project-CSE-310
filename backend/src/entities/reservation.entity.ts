import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
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
  @Column({ type: 'int', nullable: false })
  userId: number;

  @Column({ type: 'int', nullable: false })
  bookId: number;

  @Column({ type: 'enum', enum: ReservationStatus, default: ReservationStatus.WAI, nullable: false })
  status: ReservationStatus;

  @JoinColumn()
  @ManyToOne(() => User, (user) => user.reservations)
  user: User;

  @JoinColumn()
  @ManyToOne(() => Book, (book) => book.reservations)
  book: Book;
}
