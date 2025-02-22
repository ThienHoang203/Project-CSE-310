import { Injectable, UnauthorizedException } from '@nestjs/common';
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
import { compareHashedString, hashToken } from 'src/utils/hashing';
export type TokenPayloadType = {
  userId: bigint;
  role: string;
  membershipLevel: string | null;
};

export type RefreshTokenPayloadType = {
  userId: bigint;
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
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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
    console.log('re;:::::', refreshTokenExpireTime);

    return this.jwtService.sign(payload, { expiresIn: refreshTokenExpireTime });
  }

  async storeRefreshToken(userId: bigint): Promise<{ refreshToken: string; exprires_in: Date }> {
    const refreshToken = this.refreshTokenRepository.create();

    refreshToken.userId = userId;

    refreshToken.hashedTokenId = uuidv4();

    const currentTime = new Date();
    refreshToken.expriresAt = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000);

    const token = this.generateRefreshToken({ id: refreshToken.hashedTokenId, userId: userId });
    console.log('token::::', this.jwtService.decode(token));

    const hashedToken = await hashToken(token);
    refreshToken.hashedToken = hashedToken;

    await this.refreshTokenRepository.save(refreshToken);
    return {
      refreshToken: token,
      exprires_in: refreshToken.expriresAt,
    };
  }

  async verifyRefeshToken(tokenId: string, userId: bigint, refreshToken: string): Promise<any> {
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
}
