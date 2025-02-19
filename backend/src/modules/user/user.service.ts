import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { Equal, Not, Repository } from 'typeorm';
import UpdateUserDto from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import CreateUserDto from './dto/create-user.dto';
import { formattedUserLoginRespsonse, formattedUserRespsonse } from 'src/utils/format';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UserService {
  // private logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailerService: MailerService,
  ) {}

  async findById(id: bigint): Promise<User> {
    const user: User | null = await this.userRepository.findOne({
      where: { id: id },
      select: formattedUserLoginRespsonse,
    });
    // this.logger.error('find user by ID::', user);
    if (!user) {
      throw new HttpException(`User(ID: ${id}) doesn't exist`, HttpStatus.NOT_FOUND);
    }
    return user;
  }

  findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username: username },
      select: formattedUserLoginRespsonse,
    });
  }

  async findAll(): Promise<any> {
    const [users, count] = await this.userRepository.findAndCount({
      select: formattedUserRespsonse,
    });
    return {
      users: users,
      totalUser: count,
    };
  }

  async findUsers(currentPage: number, pageSize: number): Promise<any> {
    return this.userRepository.find({
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    });
  }

  async create(userData: CreateUserDto): Promise<any> {
    //Check if the email or phone number or username has already existed
    let user: User | null = await this.userRepository.findOneBy([
      { email: userData.email ?? '' },
      { phoneNumber: userData.phoneNumber ?? '' },
      { username: userData.username ?? '' },
    ]);
    if (user) {
      if (userData.username === user.username) {
        throw new ConflictException(`username: ${userData.username} đã tồn tại`);
      } else if (userData.email === user.email) {
        throw new ConflictException(`email: ${userData.email} đã tồn tại`);
      } else if (userData.phoneNumber === user.phoneNumber) {
        throw new ConflictException(`số điện thoại: ${userData.phoneNumber} đã tồn tại`);
      }
    }

    //If those fields have not in any record, it will create a new user
    const hashPassword = await this.hashPassword(userData.password);
    userData.password = hashPassword;
    user = this.userRepository.create(userData);
    const result = await this.userRepository.insert(user);
    if (result.raw.affectedRows !== 1)
      throw new InternalServerErrorException('database bị lỗi, vui lòng thử lại!');
    this.mailerService.sendMail({
      to: user.email,
      subject: 'Active your account',
      template: 'register',
      context: {
        name: user.name ?? user.email,
      },
    });
    return {
      message: 'user was created',
      userId: result.identifiers[0].id,
      status: HttpStatus.CREATED,
    };
  }

  hashPassword(pass: string): Promise<string> {
    return bcrypt.hash(pass, 10);
  }

  async update(id: bigint, userData: UpdateUserDto): Promise<any> {
    const user: User | null = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException(`không tìm thấy user(id = ${id})`);

    let isExisting: boolean = false;

    if ('email' in userData)
      isExisting = await this.userRepository.exists({
        where: { email: Equal(userData.email), id: Not(Equal(id)) },
      });
    if (isExisting) throw new ConflictException(`email: ${userData.email} đã tồn tại`);

    if ('phoneNumber' in userData)
      isExisting = await this.userRepository.exists({
        where: { phoneNumber: Equal(userData.phoneNumber), id: Not(Equal(id)) },
      });
    if (isExisting) throw new ConflictException(`số điện thoại: ${userData.phoneNumber} đã tồn tại`);

    Object.entries(userData).forEach(([key, value]) => {
      if (value) user[`${key}`] = value;
    });

    if ('password' in userData) user.password = await this.hashPassword(userData.password);

    const result = await this.userRepository.save(user);

    if (!result) {
      throw new HttpException('unsuccessfully updated', HttpStatus.BAD_REQUEST);
    }
    return result;
  }

  async delete(id: bigint): Promise<any> {
    const user: User | null = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new HttpException(`User(ID: ${id}) doesn't exist`, HttpStatus.NOT_FOUND);
    }
    await this.userRepository.delete({ id: id });
    return { message: `User(ID: ${id}) was deleted`, status: HttpStatus.OK };
  }
}
