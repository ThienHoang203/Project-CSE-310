import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntityLight } from './entity-light.entity';
import { User } from './user.entity';
import { Book } from './book.entity';

@Entity()
export class Wishlist extends AbstractEntityLight {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  @Column({ type: 'int', nullable: false })
  userId: bigint;

  @Column({ type: 'text', nullable: false })
  bookId: bigint;

  @JoinColumn()
  @ManyToOne(() => User, (user) => user.wishlists)
  user: User;

  @JoinColumn()
  @ManyToOne(() => Book, (book) => book.wishlists)
  book: Book;
}
