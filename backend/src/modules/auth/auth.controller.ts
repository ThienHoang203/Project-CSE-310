import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  Session,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'src/decorator/public-route.decorator';
import RetryPasswordDto from './dto/retry-password.dto';
import ResetPasswordDto from './dto/reset-password.dto';
import { checkAndGetIntValue } from 'src/utils/checkType';
import { LocalAuthGuard } from 'src/guards/local-auth.guard';
import CreateUserDto from '../user/dto/create-user.dto';
import { ResponseMessage } from 'src/decorator/response-message.decorator';
import { isEmpty } from 'class-validator';
import { Request, Response } from 'express';
import { User } from 'src/entities/user.entity';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Public()
  @UseGuards(LocalAuthGuard)
  login(@Req() req: Request) {
    if (!req.user) throw new BadRequestException('User not found in request');

    return this.authService.login(req.user as User);
  }

  //for normal user sign-up
  @Post('signup')
  @Public()
  @ResponseMessage('Tạo tài khoản thành công!')
  async signUp(@Body() signupData: CreateUserDto) {
    return this.authService.signup(signupData);
  }

  //for admin sign-up
  @Post('signup/admin')
  @Public()
  @ResponseMessage('Tạo tài khoản admin thành công, chờ ADMIN active tài khoản!')
  async signUpAdmin(@Body() signupData: CreateUserDto) {
    console.log({ signupData });
    return this.authService.signupAdmin(signupData);
  }

  @Post('logout')
  @ResponseMessage('Đăng xuất thành công!')
  @HttpCode(HttpStatus.OK)
  @Public()
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    console.log(req.cookies);

    // const result = await this.authService.logout();
    // return req.logOut({}, () => {});
  }

  @Get('token-payload')
  @Public()
  async getTokenPayload(@Req() req: Request) {
    const authorization = req.headers?.authorization;

    if (!authorization) throw new BadRequestException('Authorization is missing!');

    console.log(authorization.split(' ')[1]);

    return { ...this.jwtService.decode(authorization.split(' ')[1]) };
  }

  // @Get('session')
  // @Public()
  // async getSession(@Session() session: Record<string, any>) {
  //   console.log(session);
  //   console.log(session.id);
  //   session.authenticated = true;
  //   return session;
  // }

  @Post('forgot-password')
  @Public()
  retryPassword(@Body() userData: RetryPasswordDto) {
    return this.authService.forgotPassword(userData.email);
  }

  @Post('reset-password')
  @Public()
  resetPassword(
    @Query('id') id: string,
    @Query('userId') userId: string,
    @Query('activationCode') activationCode: string,
    @Body() { password }: ResetPasswordDto,
  ) {
    if (isEmpty(id)) throw new BadRequestException('id is missing!');

    if (isEmpty(userId)) throw new BadRequestException('userId is missing!');

    if (isEmpty(activationCode)) throw new BadRequestException('activationCode is missing!');

    const parsedIntUserId = checkAndGetIntValue(
      userId,
      `userId: ${userId} phải là số`,
      1,
      `userId(${userId}) phải lớn hơn hoặc bằng 0`,
    );

    const parsedIntId = checkAndGetIntValue(
      id,
      `userId: ${id} phải là số`,
      1,
      `userId(${id}) phải lớn hơn hoặc bằng 0`,
    );

    return this.authService.resetPassword(parsedIntUserId, parsedIntId, activationCode, password);
  }
}
