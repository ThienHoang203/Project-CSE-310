import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntityLight } from './entity-light.entity';

@Entity()
export class Wishlist extends AbstractEntityLight {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  @Column({ type: 'int', nullable: false })
  userId: bigint;

  @Column({ type: 'text', nullable: false })
  bookId: bigint;
}
