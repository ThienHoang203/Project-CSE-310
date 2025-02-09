import { AbstractEntity } from 'src/utils/entity';
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

  @Column({ type: 'json', nullable: true })
  deviceInfo: JSON;

  @Column({ type: 'int', nullable: false })
  userId: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn()
  user: User;
}
