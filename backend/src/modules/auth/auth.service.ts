import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
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

export type TokenPayloadType = {
  userId: number;
  role: string;
  membershipLevel: string | null;
};

export type RefreshTokenPayloadType = {
  userId: number;
  id: string;
};

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
    const accessTokenExpireTime = this.jwtService.decode(accessToken, { json: true });

    const refreshToken = await this.storeRefreshToken(id);
    // formattedDate.format(new Date(new Date().getTime() + 5 * 60 * 1000))
    return {
      access_token: {
        token: accessToken,
        exprires_in: formattedDate.format(new Date(accessTokenExpireTime.exp * 1000)),
      },
      refresh_token: {
        token: refreshToken.refreshToken,
        exprires_in: formattedDate.format(refreshToken.exprires_in),
      },
    };
  }

  async validateUser({ username, password }: LoginDto): Promise<User | null> {
    const user = await this.userService.findByUsername(username);

    if (!user) return null;

    const isMatch = await compareHashedString(password, user.password);

    if (!isMatch) return null;

    return user;
  }

  generateAccessToken(payload: TokenPayloadType): string {
    return this.jwtService.sign(payload);
  }

  generateRefreshToken(payload: RefreshTokenPayloadType): string {
    const refreshTokenExpireTime = this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRE_TIME');

    return this.jwtService.sign(payload, { expiresIn: refreshTokenExpireTime });
  }

  async storeRefreshToken(userId: number): Promise<{ refreshToken: string; exprires_in: Date }> {
    const refreshToken = this.refreshTokenRepository.create();

    refreshToken.userId = userId;

    refreshToken.hashedTokenId = uuidv4();

    const currentTime = new Date();

    refreshToken.expriresAt = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000);

    const token = this.generateRefreshToken({ id: refreshToken.hashedTokenId, userId: userId });

    const hashedToken = await hashString(token);
    refreshToken.hashedToken = hashedToken;

    await this.refreshTokenRepository.save(refreshToken);
    return {
      refreshToken: token,
      exprires_in: refreshToken.expriresAt,
    };
  }

  async verifyRefeshToken(tokenId: string, userId: number, refreshToken: string): Promise<any> {
    const token = await this.refreshTokenRepository.findOneBy({
      hashedTokenId: tokenId,
      userId: userId,
    });

    if (token) {
      const isMatch = await compareHashedString(refreshToken, token.hashedToken);

      if (isMatch) return { tokenId, userId };
    }

    //if token is invalid, throw new exception
    throw new UnauthorizedException('refresh token is invalid!');
  }

  async forgotPassword(email: string): Promise<{ id: number; userId: number; email: string }> {
    const user = await this.userService.findByEmail(email);
    const activation_code = uuidv4();

    const hashActivationCode = await hashString(activation_code);

    const currentTime = Date.now();

    const expires_in = new Date(currentTime + 5 * 60 * 1000); //code is going to expire after 5 minutes

    console.log('expires_in: ', expires_in);

    const result = await this.resetPasswordRepository.insert({
      activation_code: hashActivationCode,
      userId: user.id,
      expires_in: expires_in,
    });

    this.mailerService.sendMail({
      to: user.email,
      subject: 'Activate Code Reset Password',
      template: 'forgot-password',
      context: {
        name: user.name ?? user.email,
        activationCode: activation_code,
      },
    });
    return { id: result.identifiers[0]?.id, email: user.email, userId: user.id };
  }

  async resetPassword(userId: number, id: number, activateCode: string, newPlainPassword: string) {
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

    if (compare === false) throw new BadRequestException(`activateCode: ${activateCode} does not match!`);

    return this.userService.resetNewPassword(userId, newPlainPassword);
  }
}
