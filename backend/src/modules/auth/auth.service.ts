import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserMembershipLevel, UserRole, UserStatus } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { RefeshToken } from 'src/entities/refesh-token.entity';
import { v4 as uuidv4 } from 'uuid';
import { dateFormatter } from 'src/utils/format';
import { ConfigService } from '@nestjs/config';
import LoginDto from './dto/login.dto';
import { compareHashedString, hashString } from 'src/utils/hashing';
import { MailerService } from '@nestjs-modules/mailer';
import ResetPassword from 'src/entities/reset-password.entity';
import CreateUserDto from '../user/dto/create-user.dto';

export type TokenPayloadType = {
  userId: number;
  role: UserRole;
  membershipLevel: UserMembershipLevel | null;
};

export type RefreshTokenPayloadType = {
  userId: number;
  deviceId: string;
};

export type NewTokenPayloadType = RefreshTokenPayloadType & { role: UserRole; accessToken: string };

export type TokensType = {
  access_token: string;
  refresh_token: string;
};

export type RefreshTokenVerifiedType = { token: string; id: number };

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(RefeshToken)
    private readonly refreshTokenRepository: Repository<RefeshToken>,
    @InjectRepository(ResetPassword)
    private readonly resetPasswordRepository: Repository<ResetPassword>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {}

  async login({ id, role, membershipLevel }: User): Promise<any> {
    const formattedDate = dateFormatter(4);

    const accessToken = this.generateAccessToken({ membershipLevel, role, userId: id });
    const accessTokenExpireTime = this.jwtService.decode(accessToken);

    const refreshToken = this.generateRefreshToken({ userId: id, deviceId: uuidv4() });
    const storeRefreshToken = await this.storeRefreshToken(refreshToken);

    return {
      access_token: {
        token: accessToken,
        exprires_in: formattedDate.format(new Date(accessTokenExpireTime.exp * 1000)),
      },
      refresh_token: {
        token: refreshToken,
        exprires_in: formattedDate.format(storeRefreshToken.exprires_in),
      },
    };
  }

  async signup(signupData: CreateUserDto): Promise<any> {
    const result = await this.userService.create(signupData);
    this.sendSignupEmail(result.email, result.username);
    return result;
  }

  async signupAdmin(signupData: CreateUserDto): Promise<any> {
    const result = await this.userService.createAdmin(signupData);
    this.sendSignupEmail(result.email, result.username);
    return result;
  }

  async logout() {}

  sendSignupEmail(email: string, username?: string) {
    this.mailerService.sendMail({
      to: email,
      subject: 'Sign-up your account',
      template: 'register',
      context: {
        name: username ?? email,
      },
    });
  }

  async validateUser({ username, password }: LoginDto): Promise<User> {
    const user = await this.userService.findByUsername(username);

    if (user.status === UserStatus.DISABLE)
      throw new ForbiddenException(`username: ${user.username} không còn hoạt động`);

    const isMatch = await compareHashedString(password, user.password);

    if (!isMatch) throw new UnauthorizedException(`password: ${password} không đúng!`);

    return user;
  }

  generateAccessToken(payload: TokenPayloadType): string {
    return this.jwtService.sign(payload);
  }

  generateRefreshToken(payload: RefreshTokenPayloadType): string {
    const refreshTokenExpireTime = this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRE_TIME');
    const refreshTokenSecretKey = this.configService.get<string>('JWT_REFRESH_SECRET_KEY');
    return this.jwtService.sign(payload, {
      expiresIn: refreshTokenExpireTime,
      secret: refreshTokenSecretKey,
    });
  }

  async storeRefreshToken(
    refreshToken: string,
  ): Promise<{ refreshToken: string; exprires_in: Date }> {
    const extractedToken = this.jwtService.decode(refreshToken);

    await this.refreshTokenRepository.delete({
      userId: extractedToken.userId,
      deviceId: extractedToken.deviceId,
    });

    const hashedToken = await hashString(refreshToken);

    const expireTime = new Date(extractedToken.exp * 1000);

    const result = await this.refreshTokenRepository.insert({
      userId: extractedToken.userId,
      deviceId: extractedToken.deviceId,
      expriresIn: expireTime,
      token: hashedToken,
    });

    if (result.identifiers.length < 1)
      throw new InternalServerErrorException('Store refresh token unsuccessfully!');

    return {
      refreshToken,
      exprires_in: expireTime,
    };
  }

  async forgotPassword(email: string): Promise<{ id: number; userId: number; email: string }> {
    const user = await this.userService.findByEmail(email);
    const activation_code = uuidv4();
    console.log({ user });

    const hashActivationCode = await hashString(activation_code);

    const currentTime = Date.now();

    const expires_in = new Date(currentTime + 5 * 60 * 1000); //code is going to expire after 5 minutes

    const result = await this.resetPasswordRepository.insert({
      activation_code: hashActivationCode,
      userId: user.id,
      expires_in: expires_in,
    });

    if (result.identifiers.length === 0 || !result.identifiers[0]?.id)
      throw new InternalServerErrorException('forgotPassword thất bại!');

    this.sendResetPasswordEmail(email, activation_code, result.identifiers[0].id, user.id);
    return { id: result.identifiers[0]?.id, email: user.email, userId: user.id };
  }

  sendResetPasswordEmail(
    email: string,
    activationCode: string,
    id: number,
    userId: number,
    name?: string,
  ) {
    this.mailerService.sendMail({
      to: email,
      subject: 'Activate Code Reset Password',
      template: 'forgot-password',
      context: {
        name: name ?? email,
        id: id,
        activationCode: activationCode,
        userId: userId,
      },
    });
  }

  async resetPassword(
    userId: number,
    id: number,
    activateCode: string,
    newPlainPassword: string,
  ): Promise<{ userId: number }> {
    const currentTime = Date.now();

    const resetPassword = await this.resetPasswordRepository.findOne({
      where: {
        id,
        userId,
      },
      select: ['id', 'activation_code', 'expires_in'],
    });

    if (!resetPassword) throw new NotFoundException('Not found reset-password');

    if (currentTime > resetPassword.expires_in.getTime())
      throw new BadRequestException('activateCode expired!');

    const compare = await compareHashedString(activateCode, resetPassword.activation_code);

    if (!compare) throw new BadRequestException(`activateCode: ${activateCode} does not match!`);

    const resetResult = await this.userService.resetNewPassword(userId, newPlainPassword);

    this.resetPasswordRepository.delete({ userId: userId });

    return resetResult;
  }
}
