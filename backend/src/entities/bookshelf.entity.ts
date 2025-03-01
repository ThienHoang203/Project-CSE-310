import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntityLight } from './entity-light.entity';
import { User } from './user.entity';
import { Book } from './book.entity';

@Entity()
export class Bookshelf extends AbstractEntityLight {
  @Column({ type: 'int', nullable: false })
  userId: number;

  @Column({ type: 'int', nullable: false })
  bookId: number;

  @JoinColumn()
  @ManyToOne(() => User, (user) => user.bookshelf)
  user: User;

  @JoinColumn()
  @ManyToOne(() => Book, (book) => book.bookshelf)
  book: Book;
}
