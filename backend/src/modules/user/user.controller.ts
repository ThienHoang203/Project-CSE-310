import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import CreateUserDto from './dto/create-user.dto';
import UpdateUserDto from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // param
  @Get('/:id')
  find(@Param('id') id: string) {
    return this.userService.findById(+id);
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
    if (!userData) {
      throw new HttpException('empty data', HttpStatus.BAD_REQUEST);
    }
    return this.userService.create(userData);
  }

  @Patch('/:id')
  update(
    @Param('id') id: string,
    @Body()
    userData: UpdateUserDto,
  ) {
    if (!userData) {
      throw new HttpException('empty data', HttpStatus.BAD_REQUEST);
    }
    return this.userService.update(+id, userData);
  }

  @Delete('/:id')
  delete(@Param('id') id: string) {
    return this.userService.delete(+id);
  }
}
