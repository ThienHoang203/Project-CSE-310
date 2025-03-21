import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import UpdateUserDto from './dto/update-user.dto';
import { Public } from 'src/decorator/public-route.decorator';
import { Roles } from 'src/decorator/roles.decorator';
import { UserRole } from 'src/entities/user.entity';
import UpdatePasswordUserDto from './dto/update-password-user.dto';
import { plainToInstance } from 'class-transformer';
import { UserInfoDto } from './dto/user-info.dto';
import { ResponseMessage } from 'src/decorator/response-message.decorator';
import { checkAndGetIntValue } from 'src/utils/checkType';
import { Request } from 'express';
import { NewTokenPayloadType, TokenPayloadType } from '../auth/auth.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // get the user information but hide the password
  @Get('profile')
  async findMyAccount(@Req() req: Request) {
    if (!req.user || Object.keys(req.user).length === 0)
      throw new BadRequestException('accessToken không có payload');

    const payload = req.user as TokenPayloadType | NewTokenPayloadType;
    if (!payload.userId) throw new BadRequestException('userId không có trong payload!');

    const user = await this.userService.findById(payload.userId);

    return plainToInstance(UserInfoDto, user);
  }

  @Get('profile/:userId')
  @Roles(UserRole.ADMIN)
  async findOne(@Param('userId') userId: string) {
    const parsedIntID = checkAndGetIntValue(
      userId,
      `userId: ${userId} phải là số nguyên`,
      0,
      `userId: ${userId} không được bé hơn 0`,
    );

    const user = await this.userService.findById(parsedIntID);

    return plainToInstance(UserInfoDto, user);
  }

  // get all account
  @Get('accounts')
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.userService.findAll();
  }

  // get and split users by pages
  @Get('accounts/pagination')
  @Roles(UserRole.ADMIN)
  findLimitedSize(@Query('currentPage') currentPage: string, @Query('pageSize') pageSize: string) {
    const parsedIntPage = checkAndGetIntValue(
      currentPage,
      `currentPage: ${currentPage} phải là số`,
      1,
      `currentPage(${currentPage}) phải lớn hơn 0`,
    );

    const parsedIntSize = checkAndGetIntValue(
      pageSize,
      `pageSize: ${pageSize} phải là số`,
      1,
      `pageSize(${pageSize}) phải lớn hơn 0`,
    );

    return this.userService.findLimited(parsedIntPage, parsedIntSize);
  }

  // update user's information
  @Patch()
  @ResponseMessage('Cập nhật thông tin người dùng thành công.')
  updateMyInformation(@Req() req: Request, @Body() userData: UpdateUserDto) {
    if (!req.user || Object.keys(req.user).length === 0)
      throw new BadRequestException('accessToken không có payload');

    const payload = req.user as TokenPayloadType | NewTokenPayloadType;
    if (!payload.userId) throw new BadRequestException('userId không có trong payload!');

    if (!userData) throw new BadRequestException('empty data');

    return this.userService.update(payload.userId, userData);
  }

  // change password of the user
  @Patch('change-password')
  @ResponseMessage('Cập nhật mật khẩu thành công.')
  updateMyPassword(@Req() req: Request, @Body() userData: UpdatePasswordUserDto) {
    if (!req.user || Object.keys(req.user).length === 0)
      throw new BadRequestException('accessToken không có payload');

    const payload = req.user as TokenPayloadType | NewTokenPayloadType;
    if (!payload.userId) throw new BadRequestException('userId không có trong payload!');

    return this.userService.updatePassword(
      payload.userId,
      userData.newPassword,
      userData.oldPassword,
    );
  }

  // users can disable their account, but cannot delete
  @Patch('disable')
  @ResponseMessage('This account was disabled.')
  disableMyAccount(@Req() req: Request) {
    if (!req.user || Object.keys(req.user).length === 0)
      throw new BadRequestException('accessToken không có payload');

    const payload = req.user as TokenPayloadType | NewTokenPayloadType;
    if (!payload.userId) throw new BadRequestException('userId không có trong payload!');

    return this.userService.disableUser(payload.userId);
  }

  // force to disable a account
  @Patch('disable/:userId')
  @ResponseMessage('This account was disabled.')
  @Roles(UserRole.ADMIN)
  disableUser(@Param('userId') userId: string) {
    const parsedIntID = checkAndGetIntValue(
      userId,
      `userId: ${userId} phải là số nguyên`,
      0,
      `userId: ${userId} không được bé hơn 0`,
    );

    return this.userService.disableUser(parsedIntID);
  }

  // delete a user
  @Delete(':userId')
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Xóa thành công.')
  deleteOne(@Param('userId') userId: string) {
    const parsedIntID = checkAndGetIntValue(
      userId,
      `userId: ${userId} phải là số nguyên`,
      0,
      `userId: ${userId} không được bé hơn 0`,
    );

    return this.userService.delete(parsedIntID);
  }
}
