import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SortOrder, User, UserRole, UserSortType, UserStatus } from '../../entities/user.entity';
import { Equal, Like, Not, Repository } from 'typeorm';
import UpdateUserDto from './dto/update-user.dto';
import CreateUserDto from './dto/create-user.dto';
import { formattedUserRespsonse } from 'src/utils/format';
import { compareHashedString, hashString } from 'src/utils/hashing';
import PaginationUserDto from './dto/pagination-user.dto';
import SearchUserDto from './dto/search-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async hasUserId(userId: number): Promise<true> {
    const has = await this.userRepository.existsBy({ id: userId });
    if (!has) throw new NotFoundException(`UserId: ${userId} không tồn tại!`);
    return true;
  }

  //findById() is going to throw new Exception if there is no user found
  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) throw new NotFoundException(`Người dùng(ID: ${id}) không tồn tại`);

    return user;
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ username });

    if (!user) throw new NotFoundException(`Người dùng(username: ${username}) không tồn tại`);

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ email });

    if (!user) throw new NotFoundException(`Người dùng(email: ${email}) không tồn tại`);

    return user;
  }

  async paginateUsersByCriteria({
    limit,
    page,
    sortBy,
    sortOrder,
  }: PaginationUserDto): Promise<{ totalUsers: number; users: User[] }> {
    let users: User[];

    if (page === undefined || limit === undefined)
      users = await this.userRepository.find({
        select: formattedUserRespsonse,
        order: { [sortBy]: sortOrder },
      });
    else
      users = await this.userRepository.find({
        select: formattedUserRespsonse,
        order: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      });

    return {
      totalUsers: users.length,
      users: users,
    };
  }

  async searchUsers(searchUserDto: SearchUserDto): Promise<{ totalUsers: number; users: User[] }> {
    const { username, email, phoneNumber, name, birthDate, role, status, membershipLevel } =
      searchUserDto;
    let users: User[];
    let where: any = {};
    if (username) where.username = Like(`%${username}%`);
    if (email) where.email = Like(`%${email}%`);
    if (phoneNumber) where.phoneNumber = Like(`%${phoneNumber}%`);
    if (name) where.name = Like(`%${name}%`);
    if (birthDate) where.birthDate = birthDate;
    if (role) where.role = role;
    if (status) where.status = status;
    if (membershipLevel) where.membershipLevel = membershipLevel;
    users = await this.userRepository.find({
      select: formattedUserRespsonse,
      where: where,
    });
    return {
      totalUsers: users.length,
      users: users,
    };
  }

  async create(signupData: CreateUserDto): Promise<{ username: string; email: string }> {
    //Check if the email or phone number or username has already existed
    let user: User | null = await this.userRepository.findOneBy([
      { email: signupData.email ?? '' },
      { phoneNumber: signupData.phoneNumber ?? '' },
      { username: signupData.username },
    ]);

    if (user) {
      if (signupData.username === user.username) {
        throw new ConflictException(`Người dùng: ${signupData.username} đã tồn tại`);
      } else if (signupData.email === user.email) {
        throw new ConflictException(`Email: ${signupData.email} đã tồn tại`);
      } else if (signupData.phoneNumber === user.phoneNumber) {
        throw new ConflictException(`Số điện thoại: ${signupData.phoneNumber} đã tồn tại`);
      }
    }

    //If those fields have not in any record, it will create a new user
    user = this.userRepository.create(signupData);
    user.password = await hashString(signupData.password);
    const result = await this.userRepository.insert(user);

    if (result.identifiers.length < 1)
      throw new InternalServerErrorException('Tạo mới user không thành công!');

    return {
      username: user.username,
      email: user.email,
    };
  }

  async createAdmin(userData: CreateUserDto): Promise<{ username: string; email: string }> {
    const result = await this.create(userData);
    const disableUserInfo = await this.userRepository.update(
      { username: result.username },
      { status: UserStatus.DISABLE, role: UserRole.ADMIN },
    );

    if (disableUserInfo.affected !== 1)
      throw new InternalServerErrorException('Tạo mới admin khong thành công!');

    return result;
  }

  async update(userId: number, userData: UpdateUserDto): Promise<{ userId: number }> {
    let isExisting: boolean = false;

    if ('email' in userData) {
      isExisting = await this.userRepository.exists({
        where: { email: userData.email, id: Not(Equal(userId)) },
      });

      if (isExisting) throw new ConflictException(`email: ${userData.email} đã tồn tại!`);
    }

    if ('phoneNumber' in userData) {
      isExisting = await this.userRepository.exists({
        where: { phoneNumber: Equal(userData.phoneNumber), id: Not(userId) },
      });

      if (isExisting)
        throw new ConflictException(`số điện thoại: ${userData.phoneNumber} đã tồn tại!`);
    }

    const result = await this.userRepository.update({ id: userId }, userData);

    if (!result.affected || result.affected < 1)
      throw new InternalServerErrorException('server bị lỗi, vui lòng thử lại!');

    return {
      userId: userId,
    };
  }

  async updatePassword(
    id: number,
    newPlainPassword: string,
    oldPlainPassword: string,
  ): Promise<{ userId: number }> {
    const user = await this.userRepository.findOne({ where: { id: id }, select: ['password'] });

    if (!user) throw new NotFoundException(`Người dùng(ID = ${id}) không tồn tại`);

    if (user.status === UserStatus.DISABLE)
      throw new ForbiddenException(`Người dùng(ID =${id}) không được phép cập nhật`);

    const match = await compareHashedString(oldPlainPassword, user.password);

    if (!match) throw new ConflictException(`Mật khẩu cũ không chính xác.`);

    const newHasedPassword = await hashString(newPlainPassword);

    const result = await this.userRepository.update({ id: id }, { password: newHasedPassword });

    if (!result.affected || result.affected < 1)
      throw new InternalServerErrorException('server bị lỗi, vui lòng thử lại!');

    return {
      userId: id,
    };
  }

  async resetNewPassword(userId: number, newPlainPassword: string): Promise<{ userId: number }> {
    const user = await this.findById(userId);

    if (user.status === UserStatus.DISABLE)
      throw new ForbiddenException(`Người dùng(ID =${userId}) không được phép cập nhật`);

    const hashedPassword = await hashString(newPlainPassword);

    this.userRepository.update({ id: userId }, { password: hashedPassword });

    return { userId: userId };
  }

  async delete(id: number): Promise<{ userId: number }> {
    const user: boolean = await this.userRepository.existsBy({ id });

    if (!user) throw new NotFoundException(`Người dùng(ID: ${id}) không tồn tại!`);

    const result = await this.userRepository.delete({ id: id });

    if (result.affected !== 1)
      throw new InternalServerErrorException('server bị lỗi, vui lòng thử lại!');

    return { userId: id };
  }

  async disableUser(id: number): Promise<{ userId: number }> {
    const hasUserId = await this.userRepository.existsBy({ id: id, status: UserStatus.ACTIVE });
    if (!hasUserId) throw new NotFoundException(`userId: ${id} không tồn tại, hoặc đã disable!`);

    const result = await this.userRepository.update({ id }, { status: UserStatus.DISABLE });

    if (result.affected !== 1) throw new InternalServerErrorException('server bị lỗi!');

    return { userId: id };
  }
}
