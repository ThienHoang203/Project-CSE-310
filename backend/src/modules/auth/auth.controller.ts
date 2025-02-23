import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import CreateUserDto from '../user/dto/create-user.dto';
import { LocalAuthGuard } from 'src/guards/local-auth.guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RefreshTokenAuthGuard } from 'src/guards/refresh-token-auth.guard';
import { Public } from 'src/decorator/public-route.decorator';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly mailerService: MailerService,
    // private readonly configService: ConfigService,
  ) {}

  @Post('/register')
  @Public()
  register(@Body() userData: CreateUserDto) {
    return this.userService.create(userData);
  }

  @Public()
  @Get('/mail')
  async getMail() {
    await this.mailerService
      .sendMail({
        to: { address: 'chaucc135@gmail.com', name: 'thien' },
        subject: 'Testing Nest MailerModule ✔',
        text: 'welcome',
        template: 'register',
        context: {
          name: 'Châu buồi',
          activationCode: 2003,
        },
      })
      .then((e) => {
        console.log('email::::', e);
      })
      .catch(() => {});
    return 'ok';
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  login(@Request() req: any) {
    return this.authService.login(req.user);
  }

  @Get('/profile')
  @UseGuards(JwtAuthGuard)
  profile(@Request() req) {
    return req.user;
  }

  @Post('/refresh-token')
  @UseGuards(RefreshTokenAuthGuard)
  refreshToken(@Request() req: any) {
    const { id, refreshToken, userId } = req.user;
    return this.authService.verifyRefeshToken(id, userId, refreshToken);
  }
}
