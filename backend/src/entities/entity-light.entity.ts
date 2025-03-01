import { CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

export abstract class AbstractEntityLight {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
