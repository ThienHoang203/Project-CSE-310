import { BadRequestException, Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import CreateUserDto from '../user/dto/create-user.dto';
import LoginDto from './dto/login.dto';
import { LocalAuthGuard } from 'src/guard/local-auth.guard';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('/register')
  register(@Body() userData: CreateUserDto) {
    return this.userService.create(userData);
  }

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  login(@Request() req: any) {
    console.log('req:::::', req);

    return this.authService.login(req.user);
  }

  @Get('/profile')
  @UseGuards(JwtAuthGuard)
  profile(@Request() req) {
    return req.user;
  }

  @Post('/refresh-token')
  refreshToken(@Body() { refreshToken }: { refreshToken: string }) {
    console.log('1:::::', refreshToken);

    if (!refreshToken) throw new BadRequestException('refresh token is required!');
    return this.authService.verifyRefreshToken(refreshToken);
  }
}
