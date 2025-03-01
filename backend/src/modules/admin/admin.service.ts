import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { hashString } from 'src/utils/hashing';
import { MailerService } from '@nestjs-modules/mailer';
import CreateUserDto from '../user/dto/create-user.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailerService: MailerService,
  ) {}

  async create(userData: CreateUserDto): Promise<{ userId: any; username: string; email: string }> {
    let user: User | null = await this.userRepository.findOneBy([
      { email: userData.email ?? '' },
      { phoneNumber: userData.phoneNumber ?? '' },
      { username: userData.username },
    ]);
    if (user) {
      if (userData.username === user.username) {
        throw new ConflictException(`Người dùng: ${userData.username} đã tồn tại`);
      } else if (userData?.email && userData.email === user.email) {
        throw new ConflictException(`Email: ${userData.email} đã tồn tại`);
      } else if (userData?.phoneNumber && userData.phoneNumber === user.phoneNumber) {
        throw new ConflictException(`Số điện thoại: ${userData.phoneNumber} đã tồn tại`);
      }
    }
    //If those fields have not in any record, it will create a new user
    user = this.userRepository.create(userData);
    user.password = await hashString(userData.password);
    user.role = UserRole.ADMIN;
    const result = await this.userRepository.insert(user);
    if (result.raw?.affectedRows !== 1)
      throw new InternalServerErrorException('server bị lỗi, vui lòng thử lại!');
    this.mailerService.sendMail({
      to: user.email,
      subject: 'Active your account',
      template: 'register',
      context: {
        name: user.name ?? user.email,
      },
    });
    return {
      userId: result.identifiers[0].id,
      username: userData.username,
      email: userData.email,
    };
  }
}
