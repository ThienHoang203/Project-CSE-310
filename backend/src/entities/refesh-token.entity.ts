import { AbstractEntity } from 'src/entities/entity';
import { Entity, Column, JoinColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

export type DeviceInfoType = {};

@Entity()
export class RefeshToken extends AbstractEntity {
  @Column({ type: 'int', nullable: false })
  userId: number;

  @Column({ type: 'uuid', nullable: false })
  deviceId: string;

  @Column({ type: 'text', nullable: false })
  token: string;

  @CreateDateColumn({ type: 'timestamp', nullable: false })
  expriresIn: Date;

  @JoinColumn()
  @ManyToOne(() => User, (user) => user.refeshTokens, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  user: User;
}
