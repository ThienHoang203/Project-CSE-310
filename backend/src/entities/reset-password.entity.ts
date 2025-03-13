import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { PickType } from '@nestjs/mapped-types';
import { AbstractEntity } from './entity';

// export enum ResetPasswordStatus {
//   NEW = 'new',
//   EXPIRED = 'expired',
//   USED = 'used',
// }

@Entity()
export default class ResetPassword extends AbstractEntity {
  @Column({ type: 'int', nullable: false })
  userId: number;

  @Column({ type: 'varchar', nullable: false })
  activation_code: string;

  @Column({ type: 'timestamp', nullable: true })
  expires_in: Date;

  //   @Column({ type: 'enum', enum: ResetPasswordStatus, nullable: false, default: ResetPasswordStatus.NEW })
  //   status: ResetPasswordStatus;

  @JoinColumn()
  @ManyToOne(() => User, (user) => user.resetPasswords, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  user: User;
}
