import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Request,
  Session,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import CreateUserDto from '../user/dto/create-user.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RefreshTokenAuthGuard } from 'src/guards/refresh-token-auth.guard';
import { Public } from 'src/decorator/public-route.decorator';
import { MailerService } from '@nestjs-modules/mailer';
import { SessionAuthGuard } from 'src/guards/session-auth.guard';
import RetryPasswordDto from './dto/retry-password.dto';
import ResetPasswordDto from './dto/reset-password.dto';
import { getIntValue } from 'src/utils/checkType';
import { ResponseMessage } from 'src/decorator/response-message.decorator';

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
        to: { address: 'thiencacmai13@gmail.com', name: 'thien' },
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
  // @UseGuards(LocalAuthGuard)
  @UseGuards(SessionAuthGuard)
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

  @Get('session')
  @Public()
  async getSession(@Session() session: Record<string, any>) {
    console.log(session);
    console.log(session.id);
    session.authenticated = true;
    return session;
  }

  @Get('forgot-password')
  @Public()
  retryPassword(@Body() userData: RetryPasswordDto) {
    return this.authService.forgotPassword(userData.email);
  }

  @Post('reset-password/:userId/:id')
  @Public()
  resetPassword(@Param('userId') userId: string, @Param('id') id: string, @Body() body: ResetPasswordDto) {
    const parsedIntUserId = getIntValue(userId);
    if (!parsedIntUserId || parsedIntUserId < 0)
      throw new BadRequestException(`userId: ${userId} không phải là số nguyên dương!`);

    const parsedIntId = getIntValue(id);
    if (!parsedIntId || parsedIntId < 0)
      throw new BadRequestException(`id: ${userId} không phải là số nguyên dương!`);

    const { activateCode, password } = body;

    return this.authService.resetPassword(parsedIntUserId, parsedIntId, activateCode, password);
  }
}
