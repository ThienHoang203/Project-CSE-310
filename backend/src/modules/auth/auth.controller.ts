import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import CreateUserDto from '../user/dto/create-user.dto';
import { LocalAuthGuard } from 'src/guard/local-auth.guard';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { RefreshTokenAuthGuard } from 'src/guard/refresh-token-auth.guard';

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
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  profile(@Request() req) {
    return req.user;
  }

  @UseGuards(RefreshTokenAuthGuard)
  @Post('/refresh-token')
  refreshToken(@Request() req: any) {
    const { id, refreshToken, userId } = req.user;
    return this.authService.verifyRefeshToken(id, userId, refreshToken);
  }
}
