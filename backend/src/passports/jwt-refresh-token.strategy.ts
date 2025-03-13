import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService, NewTokenPayloadType, TokenPayloadType } from 'src/modules/auth/auth.service';
import { Request } from 'express';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh-token') {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromHeader('x-refresh-token'),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET_KEY') || 'thien-refresh',
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: any): Promise<NewTokenPayloadType> {
    const authorization = request.headers.authorization;

    if (!authorization) throw new UnauthorizedException('Authorization header is missing!');

    const accessToken = authorization.split(' ')[1];

    try {
      await this.jwtService.verify(accessToken, {
        secret: this.configService.get<string>('JWT_SECRET_KEY'),
      });
    } catch (error) {
      if (!(error instanceof TokenExpiredError))
        throw new UnauthorizedException('accessToken không hợp lệ!');
    }

    const accessTokenPayload = this.jwtService.decode(accessToken) as TokenPayloadType;

    if (accessTokenPayload.userId !== payload.userId)
      throw new UnauthorizedException('accessToken và refreshToken không hợp lệ!');

    const newAccessToken = this.authService.generateAccessToken({
      membershipLevel: accessTokenPayload.membershipLevel,
      role: accessTokenPayload.role,
      userId: accessTokenPayload.userId,
    });

    return { ...payload, role: accessTokenPayload.role, accessToken: newAccessToken };
  }
}
