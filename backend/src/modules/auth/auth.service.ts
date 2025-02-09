import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { RefeshToken } from 'src/entities/refesh-token.entity';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

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
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login({ id, role, membershipLevel }: User): Promise<any> {
    const payload: TokenPayloadType = { userId: id, role: role, membershipLevel: membershipLevel };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = await this.storeRefreshToken(id);
    return {
      access_token: {
        token: accessToken,
        expires_at: new Date(new Date().getTime() + 5 * 60 * 1000).toLocaleString('vi-VN', {
          timeZone: 'Asia/Ho_Chi_Minh',
        }),
      },
      refresh_token: refreshToken,
    };
  }

  async storeRefreshToken(userId: number): Promise<{ refreshToken: string; exprires_at: string }> {
    const refreshToken = this.refreshTokenRepository.create();

    refreshToken.userId = userId;

    refreshToken.hashedTokenId = uuidv4();

    const currentTime = new Date();
    refreshToken.expriresAt = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000);

    const payload: RefreshTokenPayloadType = { id: refreshToken.hashedTokenId, userId: userId };

    const token = this.jwtService.sign(payload, {
      expiresIn: '24h',
    });
    console.log('token::::', this.jwtService.decode(token));

    const hashedToken = await bcrypt.hash(token, 10);
    refreshToken.hashedToken = hashedToken;

    await this.refreshTokenRepository.save(refreshToken);
    return {
      refreshToken: token,
      exprires_at: refreshToken.expriresAt.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
    };
  }

  async verifyRefeshToken(refeshToken: string): Promise<any> {
    const decoded: {} & RefreshTokenPayloadType = await this.jwtService.verify(refeshToken);
    console.log('decoded:::::', decoded);

    if (decoded) {
      const token = await this.refreshTokenRepository.findOneBy({
        hashedTokenId: decoded.id,
        userId: decoded.userId,
      });
      if (token) {
        const isMatch = await bcrypt.compare(refeshToken, token.hashedToken);
        if (isMatch) return decoded;
      }
    }
    throw new UnauthorizedException('invalid refresh token');
  }
}
