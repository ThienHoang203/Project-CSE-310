import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from 'src/modules/auth/auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('SECRET_KEY') || 'thien',
    });
  }

  async validate(payload: any) {
    // const isValid = await this.authService.validateRefreshToken(payload.sub);
    // if (!isValid) {
    //   throw new UnauthorizedException('refresh token không hợp lệ');
    // }
    // return { userId: payload.sub };
  }
}
