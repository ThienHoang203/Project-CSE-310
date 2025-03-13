import { Check, Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from './entity';
import { User } from './user.entity';
import { Book } from './book.entity';

@Check(`"rating" > 0 AND "rating" < 6`)
@Entity()
export class Rating extends AbstractEntity {
  @Column({ type: 'int', nullable: false })
  userId: number;

  @Column({ type: 'int', nullable: false })
  bookId: number;

  @Column({ type: 'tinyint', nullable: false })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @JoinColumn()
  @ManyToOne(() => User, (user) => user.ratings, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  user: User;

  @JoinColumn()
  @ManyToOne(() => Book, (book) => book.rating, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  book: Book;
}
