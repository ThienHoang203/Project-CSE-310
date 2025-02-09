import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { RefeshToken } from 'src/entities/refesh-token.entity';
import * as bcrypt from 'bcrypt';

export type LoginPayloadType = {
  username: string;
  id: number;
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

  async login(dataLogin: User): Promise<any> {
    const payload: LoginPayloadType = { username: dataLogin.username, id: dataLogin.id };

    const refeshToken = this.jwtService.sign(payload);

    return {
      access_token: this.jwtService.sign(payload),
      refesh_token: refeshToken,
    };
  }

  async storeRefeshToken(payload: LoginPayloadType): Promise<RefreshTokenVerifiedType> {
    const token: RefeshToken = this.refreshTokenRepository.create();

    const nowDate = new Date();
    token.expriresAt = new Date(nowDate.getTime() + 2 * 60 * 60 * 1000);

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '2h',
    });
    token.token = await bcrypt.hash(refreshToken, 10);

    console.log('token hashed::::', token.token);

    token.deviceInfo = await JSON.parse(JSON.stringify({ thien: 'ssdf' }));

    token.userId = payload.id;

    const result: RefeshToken = await this.refreshTokenRepository.save(token);

    return { token: refreshToken, id: result.id };
  }

  async verifyRefreshToken(refreshToken: string) {
    const decoded = this.jwtService.decode(refreshToken);
    console.log('decoded:::::', decoded);

    if (!decoded) throw new UnauthorizedException('invalid refresh token');
    this.checkRefreshToken(refreshToken, decoded.refesh_token.id, decoded.id);

    return decoded;
  }

  async checkRefreshToken(refreshToken: string, refreshTokenId: number, userId: number) {
    refreshToken = await bcrypt.hash(refreshToken, 10);
    const token = await this.refreshTokenRepository.findOneBy({ userId: userId, id: refreshTokenId });
    if (!token) throw new UnauthorizedException('this user do not have this refresh token');
    const isMatch = await bcrypt.compare(refreshToken, token.token);
    if (!isMatch) throw new UnauthorizedException('invalid refresh token');
    throw new HttpException('ok', HttpStatus.OK);
  }
}
