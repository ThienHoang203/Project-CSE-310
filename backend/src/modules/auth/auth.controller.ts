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

  @Public()
  @Post('/register')
  register(@Body() userData: CreateUserDto) {
    return this.userService.create(userData);
  }

  @Public()
  @Get('/mail')
  async getMail() {
    // console.log(this.configService.get('MAIL_USER'));

    await this.mailerService
      .sendMail({
        to: { address: 'chaucc135@gmail.com', name: 'thien' }, // list of receivers
        subject: 'Testing Nest MailerModule ✔', // Subject line
        text: 'welcome', // plaintext body
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

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  profile(@Request() req) {
    return req.user;
  }

  @Get('/')
  printHello() {
    return {
      message: 'heello',
    };
  }

  @UseGuards(RefreshTokenAuthGuard)
  @Post('/refresh-token')
  refreshToken(@Request() req: any) {
    const { id, refreshToken, userId } = req.user;
    return this.authService.verifyRefeshToken(id, userId, refreshToken);
  }
}
