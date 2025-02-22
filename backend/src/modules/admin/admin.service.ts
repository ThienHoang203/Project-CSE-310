import { ConflictException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { hashPassword } from 'src/utils/hashing';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userService: UserService,
    private readonly mailerService: MailerService,
  ) {}

  async create(userData: CreateAdminDto): Promise<{ message: string; userId: any; status: HttpStatus }> {
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
    user.password = await hashPassword(userData.password);
    user.role = UserRole.ADMIN;
    const result = await this.userRepository.insert(user);
    if (result.raw.affectedRows !== 1)
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
      message: 'Tạo tài khoản thành công.Bạn có thể kiểm tra email, xin cảm ơn!',
      userId: result.identifiers[0].id,
      status: HttpStatus.CREATED,
    };
  }
}
