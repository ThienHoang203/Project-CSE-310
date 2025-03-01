import { Controller, Get, Post, Body, Param, BadRequestException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Roles } from 'src/decorator/roles.decorator';
import { UserRole } from 'src/entities/user.entity';
import { Public } from 'src/decorator/public-route.decorator';
import { plainToInstance } from 'class-transformer';
import { UserService } from '../user/user.service';
import { UserInfoDto } from '../user/dto/user-info.dto';
import { getIntValue } from 'src/utils/checkType';
import CreateUserDto from '../user/dto/create-user.dto';
import { ResponseMessage } from 'src/decorator/response-message.decorator';

@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly userService: UserService,
  ) {}

  @Post()
  @ResponseMessage('Tạo tài khoản thành công.Bạn có thể kiểm tra email, xin cảm ơn!')
  @Roles()
  @Public()
  create(@Body() createAdminDto: CreateUserDto) {
    return this.adminService.create(createAdminDto);
  }

  @Get('/:id')
  async find(@Param('id') id: string) {
    const parsedIntID = getIntValue(id);

    if (!parsedIntID || parsedIntID < 0)
      throw new BadRequestException(`id: ${id} không phải là số nguyên dương!`);

    const user = await this.userService.findById(parsedIntID);

    return plainToInstance(UserInfoDto, user);
  }
}
