import {
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { Equal, Not, Repository } from 'typeorm';
import UpdateUserDto from './dto/update-user.dto';
import CreateUserDto from './dto/create-user.dto';
import { formattedUserRespsonse } from 'src/utils/format';
import { MailerService } from '@nestjs-modules/mailer';
import { compareHashedString, hashPassword } from 'src/utils/hashing';

@Injectable()
export class UserService {
  // private logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailerService: MailerService,
  ) {}

  async findById(id: bigint): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException(`Người dùng(ID: ${id}) không tồn tại`);
    return user;
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ username });
    if (!user) throw new NotFoundException(`Người dùng(username: ${username}) không tồn tại`);
    return user;
  }

  async findAll(): Promise<{ users: User[]; totalUsers: number }> {
    const [users, count] = await this.userRepository.findAndCount({
      select: formattedUserRespsonse,
    });
    if (!users) throw new NotFoundException(`Không tìm thấy bất kì người dùng nào`);
    return {
      users: users,
      totalUsers: count,
    };
  }

  async findLimited(currentPage: number, pageSize: number): Promise<User[]> {
    const users = await this.userRepository.find({
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    });
    if (!users) throw new NotFoundException(`Không tìm thấy bất kì người dùng nào`);
    return users;
  }

  async create(userData: CreateUserDto): Promise<{ message: string; userId: any; status: HttpStatus }> {
    //Check if the email or phone number or username has already existed
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

  async update(
    id: bigint,
    userData: UpdateUserDto,
  ): Promise<{ message: string; userId: any; status: HttpStatus }> {
    const user: boolean = await this.userRepository.existsBy({ id });
    if (!user) throw new NotFoundException(`Người dùng(ID = ${id}) không tồn tại`);

    let isExisting: boolean = false;

    if ('email' in userData) {
      isExisting = await this.userRepository.exists({
        where: { email: Equal(userData.email), id: Not(Equal(id)) },
      });
      if (isExisting) throw new ConflictException(`email: ${userData.email} đã tồn tại!`);
    }

    if ('phoneNumber' in userData) {
      isExisting = await this.userRepository.exists({
        where: { phoneNumber: Equal(userData.phoneNumber), id: Not(Equal(id)) },
      });
      if (isExisting) throw new ConflictException(`số điện thoại: ${userData.phoneNumber} đã tồn tại!`);
    }

    const result = await this.userRepository.update({ id }, userData);
    if (result.affected !== 1) throw new InternalServerErrorException('server bị lỗi, vui lòng thử lại!');
    return {
      message: 'Cập nhật thông tin người dùng thành công.',
      status: HttpStatus.OK,
      userId: id.toString(),
    };
  }

  async updatePassword(
    id: bigint,
    newPlainPassword: string,
    oldPlainPassword: string,
  ): Promise<{ message: string; userId: any; status: HttpStatus }> {
    const user = await this.userRepository.findOne({ where: { id: Equal(id) }, select: ['password'] });
    if (!user) throw new NotFoundException(`Người dùng(ID = ${id}) không tồn tại`);
    const match = await compareHashedString(oldPlainPassword, user.password);
    if (!match) throw new ConflictException(`Mật khẩu cũ không chính xác.`);
    const newHasedPassword = await hashPassword(newPlainPassword);
    const result = await this.userRepository.update({ id: id }, { password: newHasedPassword });
    if (result.affected !== 1) throw new InternalServerErrorException('server bị lỗi, vui lòng thử lại!');
    return {
      message: 'Cập nhật mật khẩu thành công.',
      status: HttpStatus.OK,
      userId: id.toString(),
    };
  }

  async delete(id: bigint): Promise<{ message: string; userId: any; status: HttpStatus }> {
    const user: boolean = await this.userRepository.existsBy({ id });
    if (!user) throw new NotFoundException(`Người dùng(ID: ${id}) không tồn tại!`);
    const result = await this.userRepository.delete({ id: id });
    if (result.affected !== 1) throw new InternalServerErrorException('server bị lỗi, vui lòng thử lại!');
    return { message: 'Xóa thành công.', userId: id.toString(), status: HttpStatus.OK };
  }
}
