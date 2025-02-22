import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpException,
  HttpStatus,
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

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Get('/limited')
  findUser(@Query('currentPage') currentPage, @Query('pageSize') pageSize) {
    const page = parseInt(currentPage, 10);
    const size = parseInt(pageSize, 10);
    if (isNaN(page) || page <= 0) {
      throw new BadRequestException('query param currentPage phải là số nguyên dương');
    }
    if (isNaN(size) || size <= 0) {
      throw new BadRequestException('query param pageSize phải là số nguyên dương');
    }
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

  @Roles(UserRole.ADMIN, UserRole.DEV)
  @Get()
  getAllUsers() {
    return this.userService.findAll();
  }

  @Public()
  @Post()
  create(
    @Body()
    userData: CreateUserDto,
  ) {
    if (!userData || Object.keys(userData).length === 0) {
      throw new HttpException('empty data', HttpStatus.BAD_REQUEST);
    }
    return this.userService.create(userData);
  }

  @Patch('/:id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body()
    userData: UpdateUserDto,
  ) {
    if (!userData || Object.keys(userData).length === 0)
      throw new HttpException('empty data', HttpStatus.BAD_REQUEST);

    const userID = BigInt(id);
    const payload: Express.User | undefined = req.user;
    if (!payload) throw new UnauthorizedException('Empty token!');
    const plainPayload = req.user as TokenPayloadType;

    if (BigInt(plainPayload.userId) !== userID) throw new ForbiddenException("userID doesn't match");

    return this.userService.update(userID, userData);
  }

  @Patch('/change-password/:id')
  updatePassword(
    @Req() req: Request,
    @Param('id') id: string,
    @Body()
    userData: UpdatePasswordUserDto,
  ) {
    if (!userData || Object.keys(userData).length === 0)
      throw new HttpException('empty data', HttpStatus.BAD_REQUEST);

    const userID = BigInt(id);
    const payload: Express.User | undefined = req.user;
    if (!payload) throw new UnauthorizedException('Empty token!');
    const plainPayload = req.user as TokenPayloadType;

    if (BigInt(plainPayload.userId) !== userID) throw new ForbiddenException("userID doesn't match");

    return this.userService.updatePassword(userID, userData.newPassword, userData.oldPassword);
  }

  @Delete('/:id')
  delete(@Param('id') id: string) {
    return this.userService.delete(BigInt(id));
  }
}
