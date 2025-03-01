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
import { getIntValue } from 'src/utils/checkType';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/limited')
  @Public()
  findUser(@Query('currentPage') currentPage: string, @Query('pageSize') pageSize: string) {
    const parsedIntPage = getIntValue(currentPage);

    if (!parsedIntPage || parsedIntPage < 1)
      throw new BadRequestException(`currentPage: ${currentPage} không phải số nguyên lớn hơn 0`);

    const parsedIntSize = getIntValue(pageSize);

    if (!parsedIntSize || parsedIntPage < 1)
      throw new BadRequestException(`pageSize: ${pageSize} không phải số nguyên lớn hơn 0`);

    return this.userService.findLimited(parsedIntPage, parsedIntSize);
  }

  @Get('/:id')
  async find(@Req() req: Request, @Param('id') id: string) {
    const parseIntID = getIntValue(id);

    if (!parseIntID || parseIntID < 0)
      throw new BadRequestException(`id: ${id} không phải là số nguyên dương!`);

    const payload: Express.User | undefined = req?.user;

    if (!payload) throw new UnauthorizedException('Empty token!');

    const plainPayload = req.user as TokenPayloadType;

    if (plainPayload.userId !== parseIntID) throw new ForbiddenException(`userID: ${id} doesn't match`);

    const user = await this.userService.findById(parseIntID);

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
    const parsedIntID = getIntValue(id);

    if (!parsedIntID || parsedIntID < 0)
      throw new BadRequestException(`id: ${id} không phải là số nguyên dương!`);

    if (!userData || Object.keys(userData).length === 0) throw new BadRequestException('empty data');

    const payload: Express.User | undefined = req.user;

    if (!payload) throw new UnauthorizedException('Empty token!');

    const plainPayload = req.user as TokenPayloadType;

    if (plainPayload.userId !== parsedIntID) throw new ForbiddenException("userID doesn't match");

    return this.userService.update(parsedIntID, userData);
  }

  @Patch('/change-password/:id')
  @ResponseMessage('Cập nhật mật khẩu thành công.')
  updatePassword(
    @Req() req: Request,
    @Param('id') id: string,
    @Body()
    userData: UpdatePasswordUserDto,
  ) {
    const parsedIntID = getIntValue(id);

    if (!parsedIntID || parsedIntID < 0)
      throw new BadRequestException(`id: ${id} không phải là số nguyên dương!`);

    if (!userData || Object.keys(userData).length === 0) throw new BadRequestException('empty data');

    const payload: Express.User | undefined = req.user;

    if (!payload) throw new UnauthorizedException('Empty token!');

    const plainPayload = req.user as TokenPayloadType;

    if (plainPayload.userId !== parsedIntID) throw new ForbiddenException("userID doesn't match");

    return this.userService.updatePassword(parsedIntID, userData.newPassword, userData.oldPassword);
  }

  @Delete('/:id')
  @ResponseMessage('Xóa thành công.')
  delete(@Req() req: Request, @Param('id') id: string) {
    const parsedIntID = getIntValue(id);

    if (!parsedIntID || parsedIntID < 0)
      throw new BadRequestException(`id: ${id} không phải là số nguyên dương!`);

    const payload: Express.User | undefined = req.user;

    if (!payload) throw new UnauthorizedException('Empty token!');

    const plainPayload = req.user as TokenPayloadType;

    if (plainPayload.userId !== parsedIntID) throw new ForbiddenException("userID doesn't match");

    return this.userService.delete(parsedIntID);
  }
}
