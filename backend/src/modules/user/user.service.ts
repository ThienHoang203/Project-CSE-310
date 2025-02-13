import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { DeleteResult, Equal, Not, Repository, UpdateResult } from 'typeorm';
import UpdateUserDto from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import CreateUserDto from './dto/create-user.dto';

@Injectable()
export class UserService {
  private logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: bigint): Promise<User | null> {
    const user: User | null = await this.userRepository.findOneBy({ id });
    this.logger.error('find user by ID::', user);
    if (!user) {
      throw new HttpException('not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.findByUsername(username);
    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;

    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    const user: User | null = await this.userRepository.findOneBy({ username: username });
    return user;
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find();
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
        throw new HttpException('username existed', HttpStatus.BAD_REQUEST);
      } else if (userData.email === user.email) {
        throw new HttpException('email existed', HttpStatus.BAD_REQUEST);
      } else if (userData.phoneNumber === user.phoneNumber) {
        throw new HttpException('phone number existed', HttpStatus.BAD_REQUEST);
      }
    }

    //If those fields have not in any record, it will create a new user
    const hashPassword = await this.hashPassword(userData.password);
    userData.password = hashPassword;
    user = this.userRepository.create(userData);
    const result = await this.userRepository.insert(user);
    if (result.raw.affectedRows === 1)
      return {
        message: 'user was created',
        userId: result.identifiers[0].id,
        status: HttpStatus.CREATED,
      };
    return false;
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
    if (isExisting) throw new BadRequestException('email đã tồn tại');

    if ('phoneNumber' in userData)
      isExisting = await this.userRepository.exists({
        where: { phoneNumber: Equal(userData.phoneNumber), id: Not(Equal(id)) },
      });
    if (isExisting) throw new BadRequestException('số điện thoại đã tồn tại');

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

  async delete(id: bigint) {
    const user: User | null = await this.userRepository.findOneBy({ id });
    if (!user) throw new HttpException('user not found', HttpStatus.NOT_FOUND);

    const result: User = await this.userRepository.remove(user);
    return { message: 'successfully deleted', status: HttpStatus.OK };
  }
}
