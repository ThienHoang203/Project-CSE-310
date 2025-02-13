import { CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

export abstract class AbstractEntityLight {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
