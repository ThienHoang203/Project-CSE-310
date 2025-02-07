import { AbstractEntity } from 'src/utils/entity';
import { Entity, Column } from 'typeorm';

export enum BookVersionFormat {
  PHYS = 'bản in',
  DIG = 'bản điện tử',
}

@Entity()
export class BookVersion extends AbstractEntity {
  @Column({ type: 'int', nullable: false })
  bookId: number;

  @Column({ type: 'varchar', length: 5, default: '1.0' })
  version: string;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'date', nullable: true })
  publishedDate: Date;

  @Column({ type: 'varchar', length: 300, nullable: true })
  fileURL: string;

  @Column({ type: 'enum', enum: BookVersionFormat, nullable: false })
  format: BookVersionFormat;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  price: string;
}
