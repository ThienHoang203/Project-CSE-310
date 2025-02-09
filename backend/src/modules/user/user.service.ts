import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { DeleteResult, Equal, Not, Or, Repository, UpdateResult } from 'typeorm';
import UpdateUserDto from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: number): Promise<User | null> {
    const user: User | null = await this.userRepository.findOneBy({ id });
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

  async create(userData: User): Promise<User> {
    //Check if the email or phone number or username has already existed
    let user: User | null = await this.userRepository.findOneBy([
      { email: userData.email ?? '' },
      { phoneNumber: userData.phoneNumber },
      { username: userData.username },
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
    const hashPassword = await bcrypt.hash(userData.password, 10);
    userData.password = hashPassword;
    user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async update(id: number, userData: UpdateUserDto): Promise<User | null> {
    //Check if the email or phone number has already existed
    let user: User | null = await this.userRepository.findOneBy([
      { email: userData.email ?? '', id: Not(Equal(id)) },
      { phoneNumber: userData.phoneNumber ?? '', id: Not(Equal(id)) },
    ]);
    if (user) {
      if (userData.email === user.email) {
        throw new HttpException('email existed', HttpStatus.BAD_REQUEST);
      } else if (userData.phoneNumber === user.phoneNumber) {
        throw new HttpException('phone number existed', HttpStatus.BAD_REQUEST);
      }
    }

    //Check if the user with this id hasn't already existed
    user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new HttpException('not found', HttpStatus.NOT_FOUND);
    }

    // if the user with this id has already existed
    const result: UpdateResult = await this.userRepository.update(id, userData);
    if (result.affected !== 1) {
      throw new HttpException('unsuccessfully updated', HttpStatus.BAD_REQUEST);
    }
    return this.userRepository.findOneBy({ id });
  }

  async delete(id: number) {
    const result: DeleteResult = await this.userRepository.delete(id);
    if (result.affected !== 1) {
      throw new HttpException('unsuccessful', HttpStatus.NOT_FOUND);
    }
    return { message: 'successfully deleted' };
  }
}
