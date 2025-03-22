import { AbstractEntity } from 'src/entities/entity';
import { Entity, Column, OneToMany } from 'typeorm';
import { RefeshToken } from './refesh-token.entity';
import { BorrowingTransaction } from './borrowing-transaction.entity';
import { Fine } from './fine.entity';
import { Reservation } from './reservation.entity';
import { Rating } from './rating.entity';
import { Bookshelf } from './bookshelf.entity';
import ResetPassword from './reset-password.entity';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  DEV = 'developer',
}

export enum UserMembershipLevel {
  BZ = 'bronze',
  SL = 'silver',
  GD = 'gold',
}

export enum UserStatus {
  ACTIVE = 'active',
  DISABLE = 'disable',
}

export enum UserSortType {
  ID = 'id',
  USERNAME = 'username',
  EMAIL = 'email',
  PHONE_NUMBER = 'phoneNumber',
  ROLE = 'role',
  STATUS = 'status',
  NAME = 'name',
  BIRTHDATE = 'birthDate',
  MEMBERSHIP_LEVEL = 'membershipLevel',
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
}

export enum UserFilterType {}
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

@Entity()
export class User extends AbstractEntity {
  @Column({ type: 'varchar', length: 50, nullable: false, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 10, nullable: false, unique: true })
  phoneNumber: string;

  @Column({ type: 'varchar', nullable: false })
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER, nullable: false })
  role: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE, nullable: false })
  status: UserStatus;

  @Column({ type: 'varchar', length: 50, nullable: true })
  name: string;

  @Column({ type: 'varchar', length: 200, nullable: false, unique: true })
  email: string;

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column({ type: 'enum', enum: UserMembershipLevel, nullable: true })
  membershipLevel: UserMembershipLevel;

  @OneToMany(() => Fine, (fine) => fine.user)
  fines: Fine[];

  @OneToMany(() => Rating, (rating) => rating.user)
  ratings: Rating[];

  @OneToMany(() => BorrowingTransaction, (borrowingTransaction) => borrowingTransaction.user, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  borrowingTransactions: BorrowingTransaction[];

  @OneToMany(() => RefeshToken, (token) => token.user, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  refeshTokens: RefeshToken[];

  @OneToMany(() => Reservation, (reservation) => reservation.user, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  reservations: Reservation[];

  @OneToMany(() => Bookshelf, (bookshelf) => bookshelf.user, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  bookshelf: Bookshelf[];

  @OneToMany(() => ResetPassword, (resetPassword) => resetPassword.user, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  resetPasswords: ResetPassword[];
}
