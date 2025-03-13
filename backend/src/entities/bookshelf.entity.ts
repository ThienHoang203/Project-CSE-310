import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Book } from './book.entity';
import { AbstractEntity } from './entity';

@Entity()
export class Bookshelf extends AbstractEntity {
  @Column({ type: 'int', nullable: false })
  userId: number;

  @Column({ type: 'int', nullable: false })
  bookId: number;

  @JoinColumn()
  @ManyToOne(() => User, (user) => user.bookshelf, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  user: User;

  @JoinColumn()
  @ManyToOne(() => Book, (book) => book.bookshelf, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  book: Book;
}
