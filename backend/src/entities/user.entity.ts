import { AbstractEntity } from 'src/entities/entity';
import { Entity, Column, OneToMany } from 'typeorm';
import { RefeshToken } from './refesh-token.entity';
import { BorrowingTransaction } from './borrowing-transaction.entity';
import { Fine } from './fine.entity';
import { Reservation } from './reservation.entity';
import { Rating } from './rating.entity';
import { Bookshelf } from './bookshelf.entity';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  DEV = 'developer',
}

export enum UserMembershipLevel {
  BZ = 'đồng',
  SL = 'bạc',
  GD = 'vàng',
}

export enum UserStatus {
  ACTIVE = 'active',
  DISABLE = 'disable',
}

@Entity()
export class User extends AbstractEntity {
  @Column({ type: 'varchar', length: 50, nullable: false, unique: true })
  username: string;

  @Column({ type: 'varchar', nullable: false })
  password: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  name: string;

  @Column({ type: 'varchar', length: 200, nullable: true, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 10, nullable: false, unique: true })
  phoneNumber: string;

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER, nullable: false })
  role: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE, nullable: false })
  status: UserStatus;

  @Column({ type: 'enum', enum: UserMembershipLevel, nullable: true })
  membershipLevel: UserMembershipLevel;

  @OneToMany(() => BorrowingTransaction, (borrowingTransaction) => borrowingTransaction.user)
  borrowingTransactions: BorrowingTransaction[];

  @OneToMany(() => Fine, (fine) => fine.user)
  fines: Fine[];

  @OneToMany(() => Rating, (rating) => rating.user)
  ratings: Rating[];

  @OneToMany(() => RefeshToken, (token) => token.user, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  refeshTokens: RefeshToken[];

  @OneToMany(() => Reservation, (reservation) => reservation.user)
  reservations: Reservation[];

  @OneToMany(() => Bookshelf, (bookshelf) => bookshelf.user)
  bookshelf: Bookshelf[];
}
