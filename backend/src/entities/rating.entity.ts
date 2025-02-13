import { Check, Column, Entity } from 'typeorm';
import { AbstractEntity } from './entity';

@Check(`"rating" > 0 AND "rating" < 6`)
@Entity()
export class Rating extends AbstractEntity {
  @Column({ type: 'bigint', nullable: false })
  userId: bigint;

  @Column({ type: 'bigint', nullable: false })
  bookId: bigint;

  @Column({ type: 'tinyint', nullable: false })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;
}
