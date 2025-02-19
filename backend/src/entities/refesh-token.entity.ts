import { AbstractEntity } from 'src/entities/entity';
import { Entity, Column, OneToOne, JoinColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class RefeshToken extends AbstractEntity {
  @Column({ type: 'text', nullable: false })
  hashedToken: string;

  @Column({ type: 'uuid', nullable: false })
  hashedTokenId: string;

  @CreateDateColumn({ type: 'timestamp', nullable: false })
  expriresAt: Date;

  @Column({ type: 'bool', nullable: false, default: false })
  revoked: boolean;

  @Column({ type: 'bigint', nullable: false })
  userId: bigint;

  @Column({ type: 'json', nullable: true })
  deviceInfo: JSON;

  @JoinColumn()
  @ManyToOne(() => User, (user) => user.refeshTokens, {
    onDelete: 'CASCADE',
  })
  user: User;
}
