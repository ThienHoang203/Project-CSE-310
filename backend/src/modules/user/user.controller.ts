import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import CreateUserDto from './dto/create-user.dto';
import UpdateUserDto from './dto/update-user.dto';
import { TokenPayloadType } from '../auth/auth.service';
import { Public } from 'src/decorator/public-route.decorator';
import { Roles } from 'src/decorator/roles.decorator';
import { UserRole } from 'src/entities/user.entity';
import UpdatePasswordUserDto from './dto/update-password-user.dto';
import { plainToInstance } from 'class-transformer';
import { UserInfoDto } from './dto/user-info.dto';
import { Request } from 'express';
import { ResponseMessage } from 'src/decorator/response-message.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/limited')
  @Public()
  findUser(@Query('currentPage') currentPage, @Query('pageSize') pageSize) {
    const page = parseInt(currentPage, 10);

    const size = parseInt(pageSize, 10);

    if (isNaN(page) || page <= 0)
      throw new BadRequestException('query param currentPage phải là số nguyên dương');

    if (isNaN(size) || size <= 0)
      throw new BadRequestException('query param pageSize phải là số nguyên dương');

    return this.userService.findLimited(page, size);
  }

  @Get('/:id')
  async find(@Req() req: Request, @Param('id') id: string) {
    const paramID = BigInt(id);

    const payload: Express.User | undefined = req.user;

    if (!payload) throw new UnauthorizedException('Empty token!');

    const plainPayload = req.user as TokenPayloadType;

    if (BigInt(plainPayload.userId) !== paramID) throw new ForbiddenException("userID doesn't match");

    const user = await this.userService.findById(paramID);

    return plainToInstance(UserInfoDto, user);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DEV)
  getAllUsers() {
    return this.userService.findAll();
  }

  @Post()
  @ResponseMessage('Tạo tài khoản thành công.Bạn có thể kiểm tra email, xin cảm ơn!')
  @Public()
  create(
    @Body()
    userData: CreateUserDto,
  ) {
    if (!userData || Object.keys(userData).length === 0) throw new BadRequestException('empty data');

    return this.userService.create(userData);
  }

  @Patch('/:id')
  @ResponseMessage('Cập nhật thông tin người dùng thành công.')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body()
    userData: UpdateUserDto,
  ) {
    if (!userData || Object.keys(userData).length === 0) throw new BadRequestException('empty data');

    const userID = BigInt(id);

    const payload: Express.User | undefined = req.user;

    if (!payload) throw new UnauthorizedException('Empty token!');

    const plainPayload = req.user as TokenPayloadType;

    if (BigInt(plainPayload.userId) !== userID) throw new ForbiddenException("userID doesn't match");

    return this.userService.update(userID, userData);
  }

  @Patch('/change-password/:id')
  @ResponseMessage('Cập nhật mật khẩu thành công.')
  updatePassword(
    @Req() req: Request,
    @Param('id') id: string,
    @Body()
    userData: UpdatePasswordUserDto,
  ) {
    if (!userData || Object.keys(userData).length === 0) throw new BadRequestException('empty data');

    const userID = BigInt(id);

    const payload: Express.User | undefined = req.user;

    if (!payload) throw new UnauthorizedException('Empty token!');

    const plainPayload = req.user as TokenPayloadType;

    if (BigInt(plainPayload.userId) !== userID) throw new ForbiddenException("userID doesn't match");

    return this.userService.updatePassword(userID, userData.newPassword, userData.oldPassword);
  }

  @Delete('/:id')
  @ResponseMessage('Xóa thành công.')
  delete(@Req() req: Request, @Param('id') id: string) {
    const userId = BigInt(id);

    const payload: Express.User | undefined = req.user;

    if (!payload) throw new UnauthorizedException('Empty token!');

    const plainPayload = req.user as TokenPayloadType;

    if (BigInt(plainPayload.userId) !== userId) throw new ForbiddenException("userID doesn't match");

    return this.userService.delete(userId);
  }
}
