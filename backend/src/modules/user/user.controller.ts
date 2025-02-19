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
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import CreateUserDto from './dto/create-user.dto';
import UpdateUserDto from './dto/update-user.dto';
import { TokenPayloadType } from '../auth/auth.service';
import { Public } from 'src/decorator/public-route.decorator';
import { Roles } from 'src/decorator/roles.decorator';
import { UserRole } from 'src/entities/user.entity';

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
    return this.userService.findUsers(page, size);
  }

  @Get('/:id')
  find(@Request() req: any, @Param('id') id: string) {
    const paramID = BigInt(id);
    const payload: TokenPayloadType = req.user;
    if (payload.role === UserRole.USER)
      if (BigInt(payload.userId) !== paramID) throw new ForbiddenException("userID doesn't match");
    return this.userService.findById(paramID);
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
    @Request() req: any,
    @Param('id') id: string,
    @Body()
    userData: UpdateUserDto,
  ) {
    const userID = BigInt(id);
    const payload: TokenPayloadType = req.user;

    if (!userData || Object.keys(userData).length === 0)
      throw new HttpException('empty data', HttpStatus.BAD_REQUEST);

    if (BigInt(payload.userId) !== userID) throw new ForbiddenException("userID doesn't match");

    return this.userService.update(userID, userData);
  }

  @Delete('/:id')
  delete(@Param('id') id: string) {
    return this.userService.delete(BigInt(id));
  }
}
