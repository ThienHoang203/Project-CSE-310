import { PassportStrategy } from '@nestjs/passport';
import { HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
// import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { TokenPayloadType } from 'src/modules/auth/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,

      secretOrKey: configService.get<string>('JWT_SECRET_KEY') || 'thien',
    });
  }

  async validate(payload: any) {
    return payload;
  }
}
