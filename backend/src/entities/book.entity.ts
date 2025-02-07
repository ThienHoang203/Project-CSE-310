import { AbstractEntity } from 'src/utils/entity';
import { Entity, Column } from 'typeorm';

export enum BookGerne {
  MYSTERY = 'trinh thám',
  ROMANCE = 'lãng mạn',
  FANTASY = 'kỳ ảo',
  SCIENCE_FICTION = 'khoa học viễn tưởng',
  HORROR = 'kinh dị',
  THRILLER = 'giật gân / hồi hộp',
}

@Entity()
export class Book extends AbstractEntity {
  @Column({ type: 'varchar', length: 50, nullable: true })
  author: string;

  @Column({ type: 'varchar', length: 200, nullable: false })
  title: string;

  @Column({ type: 'enum', enum: BookGerne, nullable: true })
  gerne: BookGerne;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  coverImageURL: string;
}
