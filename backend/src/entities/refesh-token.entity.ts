import { AbstractEntity } from 'src/entities/entity';
import { Entity, Column, JoinColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class RefeshToken extends AbstractEntity {
  @Column({ type: 'int', nullable: false })
  userId: number;

  @Column({ type: 'uuid', nullable: false })
  hashedTokenId: string;

  @Column({ type: 'text', nullable: false })
  hashedToken: string;

  @CreateDateColumn({ type: 'timestamp', nullable: false })
  expriresAt: Date;

  @Column({ type: 'bool', nullable: false, default: false })
  revoked: boolean;

  @Column({ type: 'json', nullable: true })
  deviceInfo: JSON;

  @JoinColumn()
  @ManyToOne(() => User, (user) => user.refeshTokens, {
    onDelete: 'CASCADE',
  })
  user: User;
}
