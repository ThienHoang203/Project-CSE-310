import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import CreateUserDto from './dto/create-user.dto';
import UpdateUserDto from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { TokenPayloadType } from '../auth/auth.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // param
  @Get('/:id')
  find(@Param('id') id: string) {
    return this.userService.findById(BigInt(id));
  }

  // query param
  @Get()
  getAllUser(@Req() req: Request & { user: string }) {
    console.log('request::::', req.user);

    return this.userService.findAll();
  }

  //body
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

  @UseGuards(JwtAuthGuard)
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

    if (BigInt(payload.userId) !== userID) throw new UnauthorizedException("userID doesn't match");

    return this.userService.update(userID, userData);
  }

  @Delete('/:id')
  delete(@Param('id') id: string) {
    return this.userService.delete(BigInt(id));
  }
}
